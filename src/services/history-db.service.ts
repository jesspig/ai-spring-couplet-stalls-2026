import type { GenerationRecord, WorkflowStep, WorkflowResponse, FormData } from '../types/spring.types';

/**
 * 春联历史数据库名称
 */
const COUPLET_DB_NAME = 'SpringCoupletHistory';

/**
 * 数据库版本号
 */
const COUPLET_DB_VERSION = 1;

/**
 * 记录存储对象名称
 */
const RECORDS_STORE_NAME = 'records';

/**
 * IndexedDB 服务类
 * 管理春联生成历史记录的存储、查询和删除
 */
export class HistoryDBService {
  private database: IDBDatabase | null = null;

  /**
   * 确保数据库已初始化
   */
  private async ensureDatabase(): Promise<IDBDatabase> {
    if (!this.database) {
      await this.init();
    }
    return this.database!;
  }

  /**
   * 创建事务
   * @param mode 事务模式
   * @returns 事务和对象存储
   */
  private createTransaction(mode: IDBTransactionMode): {
    transaction: IDBTransaction;
    store: IDBObjectStore;
  } {
    const transaction = this.database!.transaction([RECORDS_STORE_NAME], mode);
    const store = transaction.objectStore(RECORDS_STORE_NAME);
    return { transaction, store };
  }

  /**
   * 将 IDBRequest 转换为 Promise
   * @param request IndexedDB 请求
   * @returns Promise
   */
  private requestToPromise<T>(request: IDBRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(new Error('操作失败'));
    });
  }

  /**
   * 创建对象存储（仅在数据库升级时调用）
   * @param db 数据库实例
   */
  private createStoreIfNeeded(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(RECORDS_STORE_NAME)) {
      const store = db.createObjectStore(RECORDS_STORE_NAME, { keyPath: 'id' });
      store.createIndex('createdAt', 'createdAt', { unique: false });
      store.createIndex('status', 'status', { unique: false });
    }
  }

  /**
   * 初始化数据库
   * 打开数据库连接，必要时创建对象存储和索引
   */
  async init(): Promise<void> {
    const request = indexedDB.open(COUPLET_DB_NAME, COUPLET_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      this.createStoreIfNeeded(db);
    };

    this.database = await this.requestToPromise<IDBDatabase>(request);
  }

  /**
   * 创建生成记录
   * @param recordId 记录唯一标识
   * @param topic 主题
   * @param wordCount 字数
   * @param formData 表单配置数据
   */
  async createRecord(
    recordId: string,
    topic: string,
    wordCount: string,
    formData: FormData
  ): Promise<void> {
    await this.ensureDatabase();

    const record: Omit<GenerationRecord, 'result' | 'error'> = {
      id: recordId,
      createdAt: Date.now(),
      topic,
      wordCount,
      formData,
      status: 'pending',
      steps: []
    };

    const { store } = this.createTransaction('readwrite');
    const request = store.add(record);

    await this.requestToPromise(request);
  }

  /**
   * 更新生成记录状态
   * @param recordId 记录唯一标识
   * @param status 新状态
   * @param result 生成结果（可选）
   * @param error 错误信息（可选）
   */
  async updateRecordStatus(
    recordId: string,
    status: 'pending' | 'completed' | 'failed' | 'aborted',
    result?: WorkflowResponse,
    error?: string
  ): Promise<void> {
    await this.ensureDatabase();

    const { store } = this.createTransaction('readwrite');
    const getRequest = store.get(recordId);
    const record = await this.requestToPromise<GenerationRecord>(getRequest);

    if (!record) {
      throw new Error('记录不存在');
    }

    record.status = status;
    if (result) record.result = result;
    if (error) record.error = error;

    const putRequest = store.put(record);
    await this.requestToPromise(putRequest);
  }

  /**
   * 添加或更新生成步骤
   * 如果存在相同名称的 running 步骤，则更新该步骤；否则添加新步骤
   * @param recordId 记录唯一标识
   * @param step 工作流步骤
   */
  async addOrUpdateStep(recordId: string, step: WorkflowStep): Promise<void> {
    await this.ensureDatabase();

    const { store } = this.createTransaction('readwrite');
    const getRequest = store.get(recordId);
    const record = await this.requestToPromise<GenerationRecord>(getRequest);

    if (!record) {
      throw new Error('记录不存在');
    }

    const existingIndex = record.steps.findIndex(
      s => s.name === step.name && s.status === 'running'
    );

    if (existingIndex !== -1 && step.status !== 'running') {
      record.steps[existingIndex] = {
        ...record.steps[existingIndex],
        status: step.status,
        output: step.output,
        error: step.error,
        endTime: step.endTime
      };
    } else {
      record.steps.push(step);
    }

    const putRequest = store.put(record);
    await this.requestToPromise(putRequest);
  }

  /**
   * 添加生成步骤（已弃用，请使用 addOrUpdateStep）
   * @deprecated 使用 addOrUpdateStep 替代
   */
  async addStep(recordId: string, step: WorkflowStep): Promise<void> {
    return this.addOrUpdateStep(recordId, step);
  }

  /**
   * 获取生成记录
   * @param recordId 记录唯一标识
   * @returns 生成记录或 null
   */
  async getRecord(recordId: string): Promise<GenerationRecord | null> {
    await this.ensureDatabase();

    const { store } = this.createTransaction('readonly');
    const request = store.get(recordId);

    return await this.requestToPromise<GenerationRecord | null>(request);
  }

  /**
   * 获取所有生成记录（按创建时间倒序）
   * @returns 生成记录列表
   */
  async getAllRecords(): Promise<GenerationRecord[]> {
    await this.ensureDatabase();

    const { store } = this.createTransaction('readonly');
    const index = store.index('createdAt');
    const request = index.openCursor(null, 'prev');

    return new Promise((resolve, reject) => {
      const records: GenerationRecord[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null;
        if (cursor) {
          records.push(cursor.value);
          cursor.continue();
        } else {
          resolve(records);
        }
      };

      request.onerror = () => reject(new Error('获取记录列表失败'));
    });
  }

  /**
   * 删除生成记录
   * @param recordId 记录唯一标识
   */
  async deleteRecord(recordId: string): Promise<void> {
    await this.ensureDatabase();

    const { store } = this.createTransaction('readwrite');
    const request = store.delete(recordId);

    await this.requestToPromise(request);
  }

  /**
   * 清空所有记录
   */
  async clearAllRecords(): Promise<void> {
    await this.ensureDatabase();

    const { store } = this.createTransaction('readwrite');
    const request = store.clear();

    await this.requestToPromise(request);
  }
}

// 导出单例实例
export const historyDB = new HistoryDBService();

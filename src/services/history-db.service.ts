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
   * 初始化数据库
   * 打开数据库连接，必要时创建对象存储和索引
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(COUPLET_DB_NAME, COUPLET_DB_VERSION);

      request.onerror = () => {
        reject(new Error('无法打开 IndexedDB'));
      };

      request.onsuccess = () => {
        this.database = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建对象存储，使用 id 作为主键
        if (!db.objectStoreNames.contains(RECORDS_STORE_NAME)) {
          const store = db.createObjectStore(RECORDS_STORE_NAME, { keyPath: 'id' });

          // 创建索引以便按创建时间查询
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
      };
    });
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
    if (!this.database) {
      await this.init();
    }

    const record: Omit<GenerationRecord, 'result' | 'error'> = {
      id: recordId,
      createdAt: Date.now(),
      topic,
      wordCount,
      formData,
      status: 'pending',
      steps: []
    };

    return new Promise((resolve, reject) => {
      const transaction = this.database!.transaction([RECORDS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(RECORDS_STORE_NAME);
      const request = store.add(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('创建记录失败'));
    });
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
    if (!this.database) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.database!.transaction([RECORDS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(RECORDS_STORE_NAME);
      const getRequest = store.get(recordId);

      getRequest.onsuccess = () => {
        const record = getRequest.result as GenerationRecord | undefined;
        if (!record) {
          reject(new Error('记录不存在'));
          return;
        }

        record.status = status;
        if (result) {
          record.result = result;
        }
        if (error) {
          record.error = error;
        }

        const putRequest = store.put(record);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('更新记录失败'));
      };

      getRequest.onerror = () => reject(new Error('获取记录失败'));
    });
  }

  /**
   * 添加或更新生成步骤
   * 如果存在相同名称的 running 步骤，则更新该步骤；否则添加新步骤
   * @param recordId 记录唯一标识
   * @param step 工作流步骤
   */
  async addOrUpdateStep(recordId: string, step: WorkflowStep): Promise<void> {
    if (!this.database) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.database!.transaction([RECORDS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(RECORDS_STORE_NAME);
      const getRequest = store.get(recordId);

      getRequest.onsuccess = () => {
        const record = getRequest.result as GenerationRecord | undefined;
        if (!record) {
          reject(new Error('记录不存在'));
          return;
        }

        // 查找是否存在相同名称的 running 步骤
        const existingIndex = record.steps.findIndex(
          s => s.name === step.name && s.status === 'running'
        );

        if (existingIndex !== -1 && step.status !== 'running') {
          // 更新现有步骤
          record.steps[existingIndex] = {
            ...record.steps[existingIndex],
            status: step.status,
            output: step.output,
            error: step.error,
            endTime: step.endTime
          };
        } else {
          // 添加新步骤
          record.steps.push(step);
        }

        const putRequest = store.put(record);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('更新步骤失败'));
      };

      getRequest.onerror = () => reject(new Error('获取记录失败'));
    });
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
    if (!this.database) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.database!.transaction([RECORDS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(RECORDS_STORE_NAME);
      const request = store.get(recordId);

      request.onsuccess = () => {
        resolve(request.result as GenerationRecord | null);
      };

      request.onerror = () => reject(new Error('获取记录失败'));
    });
  }

  /**
   * 获取所有生成记录（按创建时间倒序）
   * @returns 生成记录列表
   */
  async getAllRecords(): Promise<GenerationRecord[]> {
    if (!this.database) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.database!.transaction([RECORDS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(RECORDS_STORE_NAME);
      const index = store.index('createdAt');
      const request = index.openCursor(null, 'prev');
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
    if (!this.database) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.database!.transaction([RECORDS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(RECORDS_STORE_NAME);
      const request = store.delete(recordId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('删除记录失败'));
    });
  }

  /**
   * 清空所有记录
   */
  async clearAllRecords(): Promise<void> {
    if (!this.database) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.database!.transaction([RECORDS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(RECORDS_STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('清空记录失败'));
    });
  }
}

// 导出单例实例
export const historyDB = new HistoryDBService();

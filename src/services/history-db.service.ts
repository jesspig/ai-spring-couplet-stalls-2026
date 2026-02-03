import type { GenerationRecord, WorkflowStep, WorkflowResponse, FormData } from '../types/spring.types';

/**
 * IndexedDB 数据库名称
 */
const DB_NAME = 'SpringCoupletHistory';

/**
 * 数据库版本
 */
const DB_VERSION = 1;

/**
 * 存储名称
 */
const STORE_NAME = 'records';

/**
 * IndexedDB 服务类
 */
export class HistoryDBService {
  private db: IDBDatabase | null = null;

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('无法打开 IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储，使用 id 作为主键
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          
          // 创建索引以便按创建时间查询
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  /**
   * 创建生成记录
   */
  async createRecord(
    id: string,
    topic: string,
    wordCount: string,
    formData: FormData
  ): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    const record: Omit<GenerationRecord, 'result' | 'error'> = {
      id,
      createdAt: Date.now(),
      topic,
      wordCount,
      formData,
      status: 'pending',
      steps: []
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('创建记录失败'));
    });
  }

  /**
   * 更新生成记录状态
   */
  async updateRecordStatus(
    id: string,
    status: 'pending' | 'completed' | 'failed' | 'aborted',
    result?: WorkflowResponse,
    error?: string
  ): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

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
   * 添加生成步骤
   */
  async addStep(id: string, step: WorkflowStep): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const record = getRequest.result as GenerationRecord | undefined;
        if (!record) {
          reject(new Error('记录不存在'));
          return;
        }

        record.steps.push(step);

        const putRequest = store.put(record);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('添加步骤失败'));
      };

      getRequest.onerror = () => reject(new Error('获取记录失败'));
    });
  }

  /**
   * 获取生成记录
   */
  async getRecord(id: string): Promise<GenerationRecord | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result as GenerationRecord | null);
      };

      request.onerror = () => reject(new Error('获取记录失败'));
    });
  }

  /**
   * 获取所有生成记录（按创建时间倒序）
   */
  async getAllRecords(): Promise<GenerationRecord[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
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
   */
  async deleteRecord(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('删除记录失败'));
    });
  }

  /**
   * 清空所有记录
   */
  async clearAllRecords(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('清空记录失败'));
    });
  }
}

// 导出单例实例
export const historyDB = new HistoryDBService();
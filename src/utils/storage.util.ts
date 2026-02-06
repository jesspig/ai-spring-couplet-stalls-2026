/**
 * 布局配置接口
 */
export interface LayoutConfig {
  /** 字数 */
  wordCount: string;
  /** 对联顺序 */
  coupletOrder: string;
  /** 横批方向 */
  horizontalDirection: string;
  /** 福字方向 */
  fuOrientation: string;
}

/**
 * 存储工具类
 * 封装 localStorage 和 sessionStorage 操作
 */
export class StorageService {
  private storage: Storage;

  constructor(storageType: 'localStorage' | 'sessionStorage' = 'localStorage') {
    this.storage = storageType === 'localStorage' ? localStorage : sessionStorage;
  }

  /**
   * 获取字符串值
   */
  getString(key: string, defaultValue: string = ''): string {
    return this.storage.getItem(key) || defaultValue;
  }

  /**
   * 设置字符串值
   */
  setString(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  /**
   * 获取 JSON 对象
   */
  getObject<T>(key: string): T | null {
    const value = this.storage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * 设置 JSON 对象
   */
  setObject<T>(key: string, value: T): void {
    this.storage.setItem(key, JSON.stringify(value));
  }

  /**
   * 移除指定键
   */
  remove(key: string): void {
    this.storage.removeItem(key);
  }

  /**
   * 清空所有存储
   */
  clear(): void {
    this.storage.clear();
  }
}

// localStorage 实例
export const localStorageService = new StorageService('localStorage');

// sessionStorage 实例
export const sessionStorageService = new StorageService('sessionStorage');

/**
 * 布局配置存储键常量
 */
export const LAYOUT_CONFIG_KEYS = {
  WORD_COUNT: 'wordCount',
  COUPLET_ORDER: 'coupletOrder',
  HORIZONTAL_DIRECTION: 'horizontalDirection',
  FU_ORIENTATION: 'fuOrientation'
} as const;

/**
 * API 配置存储键常量
 */
export const API_CONFIG_KEYS = {
  API_URL: 'apiUrl',
  API_KEY: 'apiKey',
  CACHED_MODELS: 'cachedModels',
  CACHED_SELECTED_MODEL: 'cachedSelectedModel'
} as const;

/**
 * 生成会话数据存储键常量
 */
export const SESSION_DATA_KEYS = {
  TOPIC: 'topic',
  SELECTED_MODEL: 'selectedModel',
  WORD_COUNT: 'wordCount',
  COUPLET_ORDER: 'coupletOrder',
  HORIZONTAL_DIRECTION: 'horizontalDirection',
  FU_ORIENTATION: 'fuOrientation',
  RECORD_ID: 'recordId',
  GENERATED_DATA: 'generatedData'
} as const;

/**
 * 获取布局配置
 */
export function getLayoutConfig(): LayoutConfig {
  return {
    wordCount: localStorageService.getString(LAYOUT_CONFIG_KEYS.WORD_COUNT, '7'),
    coupletOrder: localStorageService.getString(LAYOUT_CONFIG_KEYS.COUPLET_ORDER, 'rightUpper'),
    horizontalDirection: localStorageService.getString(LAYOUT_CONFIG_KEYS.HORIZONTAL_DIRECTION, 'rightToLeft'),
    fuOrientation: localStorageService.getString(LAYOUT_CONFIG_KEYS.FU_ORIENTATION, 'upright')
  };
}

/**
 * 保存布局配置
 */
export function saveLayoutConfig(config: Partial<LayoutConfig>): void {
  if (config.wordCount !== undefined) {
    localStorageService.setString(LAYOUT_CONFIG_KEYS.WORD_COUNT, config.wordCount);
  }
  if (config.coupletOrder !== undefined) {
    localStorageService.setString(LAYOUT_CONFIG_KEYS.COUPLET_ORDER, config.coupletOrder);
  }
  if (config.horizontalDirection !== undefined) {
    localStorageService.setString(LAYOUT_CONFIG_KEYS.HORIZONTAL_DIRECTION, config.horizontalDirection);
  }
  if (config.fuOrientation !== undefined) {
    localStorageService.setString(LAYOUT_CONFIG_KEYS.FU_ORIENTATION, config.fuOrientation);
  }
}

/**
 * 获取 API 配置
 */
export function getApiConfig(): { apiUrl: string; apiKey: string } {
  return {
    apiUrl: localStorageService.getString(API_CONFIG_KEYS.API_URL),
    apiKey: localStorageService.getString(API_CONFIG_KEYS.API_KEY)
  };
}

/**
 * 保存 API 配置
 */
export function saveApiConfig(apiUrl: string, apiKey: string): void {
  localStorageService.setString(API_CONFIG_KEYS.API_URL, apiUrl);
  localStorageService.setString(API_CONFIG_KEYS.API_KEY, apiKey);
}

/**
 * 获取缓存的模型列表
 */
export function getCachedModels(): any[] | null {
  return localStorageService.getObject(API_CONFIG_KEYS.CACHED_MODELS);
}

/**
 * 保存缓存的模型列表
 */
export function saveCachedModels(models: any[]): void {
  localStorageService.setObject(API_CONFIG_KEYS.CACHED_MODELS, models);
}

/**
 * 获取缓存的选中模型
 */
export function getCachedSelectedModel(): string {
  return localStorageService.getString(API_CONFIG_KEYS.CACHED_SELECTED_MODEL);
}

/**
 * 保存缓存的选中模型
 */
export function saveCachedSelectedModel(modelId: string): void {
  localStorageService.setString(API_CONFIG_KEYS.CACHED_SELECTED_MODEL, modelId);
}

/**
 * 清除生成会话数据
 */
export function clearSessionData(): void {
  Object.values(SESSION_DATA_KEYS).forEach(key => {
    sessionStorageService.remove(key);
  });
}
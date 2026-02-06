import type { Model, ModelsResponse } from '../../types/model.types';

/**
 * API 配置接口
 */
export interface ApiConfig {
  /** API 基础 URL */
  baseUrl: string;
  /** API 密钥 */
  apiKey: string;
}

/**
 * API 服务类
 * 封装与 LLM API 的通用请求逻辑
 */
export class ApiService {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = {
      baseUrl: config.baseUrl.replace(/\/$/, ''),
      apiKey: config.apiKey
    };
  }

  /**
   * 获取请求头
   */
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * 获取模型列表
   * @returns 模型列表响应
   * @throws 请求失败时抛出错误
   */
  async getModels(): Promise<ModelsResponse> {
    const url = `${this.config.baseUrl}/models`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
    }

    return response.json() as Promise<ModelsResponse>;
  }

  /**
   * 发送聊天完成请求
   * @param model 模型 ID
   * @param messages 消息列表
   * @param temperature 温度参数
   * @param maxTokens 最大 token 数
   * @returns 模型响应内容
   * @throws 请求失败时抛出错误
   */
  async chatCompletion(
    model: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    temperature: number = 0.7,
    maxTokens: number = 500
  ): Promise<string> {
    const url = `${this.config.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `LLM 请求失败: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('LLM 返回内容为空');
    }

    return content;
  }

  /**
   * 测试 API 连接
   * @returns 是否连接成功
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getModels();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 创建 API 服务实例
 * @param apiUrl API URL
 * @param apiKey API Key
 * @returns API 服务实例
 */
export function createApiService(apiUrl: string, apiKey: string): ApiService {
  return new ApiService({ baseUrl: apiUrl, apiKey });
}

/**
 * 获取模型列表（便捷函数）
 * @param apiUrl API URL
 * @param apiKey API Key
 * @returns 模型列表
 */
export async function fetchModels(apiUrl: string, apiKey: string): Promise<Model[]> {
  const service = createApiService(apiUrl, apiKey);
  const response = await service.getModels();
  return response.data || [];
}
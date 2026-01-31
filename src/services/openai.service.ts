import type { OpenAIModel, OpenAIModelsResponse } from "../types/openai";

export class OpenAIService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    // 移除末尾斜杠，并检查是否已包含 /v1 路径
    const trimmedUrl = baseUrl.replace(/\/$/, "");
    // 如果 URL 以 /v1 结尾，则不重复添加
    this.baseUrl = trimmedUrl.endsWith("/v1") ? trimmedUrl.slice(0, -3) : trimmedUrl;
    this.apiKey = apiKey;
  }

  async getModels(): Promise<OpenAIModel[]> {
    const url = `${this.baseUrl}/v1/models`;

    console.log(`[OpenAIService] 请求模型列表: ${url}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      }
    });

    console.log(`[OpenAIService] 响应状态: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`获取模型列表失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = (await response.json()) as OpenAIModelsResponse;
    console.log(`[OpenAIService] 响应数据:`, JSON.stringify(data, null, 2));
    console.log(`[OpenAIService] 模型数量: ${data.data?.length || 0}`);

    return data.data || [];
  }
}
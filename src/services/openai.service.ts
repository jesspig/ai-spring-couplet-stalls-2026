import type { OpenAIModel, OpenAIModelsResponse } from "../types/openai";

export class OpenAIService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async getModels(): Promise<OpenAIModel[]> {
    const response = await fetch(`${this.baseUrl}/v1/models`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`获取模型列表失败: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as OpenAIModelsResponse;
    return data.data || [];
  }
}
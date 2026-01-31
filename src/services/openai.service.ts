import type { OpenAIModel, OpenAIModelsResponse } from "../types/openai";

export class OpenAIService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  async getModels(): Promise<OpenAIModel[]> {
    const url = `${this.baseUrl}/v1/models`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`获取模型列表失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = (await response.json()) as OpenAIModelsResponse;
    return data.data || [];
  }
}
import {
  TOPIC_ANALYSIS_SYSTEM_PROMPT,
  buildTopicAnalysisPrompt
} from '../../config/prompts';
import type { TopicAnalysisResult } from '../../types/spring.types';
import type { ApiService } from '../llm/api.service';

/**
 * 主题分析器服务
 * 负责分析主题内涵，提取关键元素
 */
export class TopicAnalyzerService {
  constructor(private apiService: ApiService, private model: string) {}

  /**
   * 分析主题
   * @param topic 主题
   * @param wordCount 字数
   * @returns 主题分析结果
   */
  async analyzeTopic(topic: string, wordCount: string): Promise<TopicAnalysisResult> {
    console.log(`  调用LLM：主题分析`);
    const userPrompt = buildTopicAnalysisPrompt(topic, wordCount);
    const content = await this.apiService.chatCompletion(
      this.model,
      [{ role: 'system', content: TOPIC_ANALYSIS_SYSTEM_PROMPT }, { role: 'user', content: userPrompt }],
      0.7,
      500
    );
    // 主题分析返回的是纯文本，不是 JSON
    return content.trim();
  }
}
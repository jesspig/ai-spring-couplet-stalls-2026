import {
  HORIZONTAL_SCROLL_SYSTEM_PROMPT,
  buildHorizontalScrollPrompt
} from '../../config/prompts';
import { parseLLMJson } from '../../utils/json-parser.util';
import type { TopicAnalysisResult } from '../../types/spring.types';
import type { ApiService } from '../llm/api.service';

/**
 * 横批生成器服务
 * 负责生成横批
 */
export class HorizontalScrollGeneratorService {
  constructor(private apiService: ApiService, private model: string) {}

  /**
   * 生成横批
   * @param topic 主题
   * @param upperCouplet 上联
   * @param lowerCouplet 下联
   * @param analysis 主题分析结果
   * @returns 横批
   */
  async generateHorizontalScroll(
    topic: string,
    upperCouplet: string,
    lowerCouplet: string,
    analysis: TopicAnalysisResult
  ): Promise<string> {
    console.log(`  调用LLM：横批生成`);
    const userPrompt = buildHorizontalScrollPrompt(topic, upperCouplet, lowerCouplet, analysis);
    const content = await this.apiService.chatCompletion(
      this.model,
      [{ role: 'system', content: HORIZONTAL_SCROLL_SYSTEM_PROMPT }, { role: 'user', content: userPrompt }],
      0.8,
      500
    );
    const result = parseLLMJson<{ horizontalScroll: string }>(content);
    return result.horizontalScroll;
  }
}
import {
  SPRING_SCROLLS_SYSTEM_PROMPT,
  buildSpringScrollsPrompt
} from '../../config/prompts';
import { parseLLMJson } from '../../utils/json-parser.util';
import type { TopicAnalysisResult } from '../../types/spring.types';
import type { ApiService } from '../llm/api.service';

/**
 * 挥春生成器服务
 * 负责生成六个四字挥春
 */
export class SpringScrollsGeneratorService {
  private static readonly DEFAULT_SCROLLS = [
    '春回大地',
    '万象更新',
    '吉星高照',
    '福气满满',
    '财源广进',
    '合家欢乐'
  ];

  constructor(private apiService: ApiService, private model: string) {}

  /**
   * 生成挥春
   * @param topic 主题
   * @param upperCouplet 上联
   * @param lowerCouplet 下联
   * @param analysis 主题分析结果
   * @returns 挥春列表
   */
  async generateSpringScrolls(
    topic: string,
    upperCouplet: string,
    lowerCouplet: string,
    analysis: TopicAnalysisResult
  ): Promise<string[]> {
    console.log(`  调用LLM：挥春生成`);
    const userPrompt = buildSpringScrollsPrompt(topic, upperCouplet, lowerCouplet, analysis);
    const content = await this.apiService.chatCompletion(
      this.model,
      [{ role: 'system', content: SPRING_SCROLLS_SYSTEM_PROMPT }, { role: 'user', content: userPrompt }],
      0.8,
      500
    );
    const result = parseLLMJson<{ springScrolls: string[] }>(content);
    return result.springScrolls;
  }

  /**
   * 生成挥春（带重试）
   * @param topic 主题
   * @param upperCouplet 上联
   * @param lowerCouplet 下联
   * @param analysis 主题分析结果
   * @param maxAttempts 最大尝试次数
   * @returns 挥春列表
   */
  async generateSpringScrollsWithRetry(
    topic: string,
    upperCouplet: string,
    lowerCouplet: string,
    analysis: TopicAnalysisResult,
    maxAttempts: number = 5
  ): Promise<string[]> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const scrolls = await this.generateSpringScrolls(topic, upperCouplet, lowerCouplet, analysis);
        
        // 验证挥春数量
        if (scrolls.length !== 6) {
          console.log(`  ✗ 挥春数量不符：期望6个，实际${scrolls.length}个`);
          if (attempt === maxAttempts) {
            console.log(`  使用默认挥春`);
            return SpringScrollsGeneratorService.DEFAULT_SCROLLS;
          }
          continue;
        }

        // 验证每个挥春都是4个字
        const invalidScrolls = scrolls.filter(s => s.length !== 4);
        if (invalidScrolls.length > 0) {
          console.log(`  ✗ 部分挥春字数不符：${invalidScrolls.join(', ')}`);
          if (attempt === maxAttempts) {
            console.log(`  使用默认挥春`);
            return SpringScrollsGeneratorService.DEFAULT_SCROLLS;
          }
          continue;
        }

        console.log(`  ✓ 挥春验证通过`);
        return scrolls;
      } catch (error) {
        console.error(`  ✗ 挥春生成失败（第${attempt}次）：`, error);
        if (attempt === maxAttempts) {
          console.log(`  使用默认挥春`);
          return SpringScrollsGeneratorService.DEFAULT_SCROLLS;
        }
      }
    }

    return SpringScrollsGeneratorService.DEFAULT_SCROLLS;
  }

  /**
   * 获取默认挥春
   * @returns 默认挥春列表
   */
  static getDefaultScrolls(): string[] {
    return [...SpringScrollsGeneratorService.DEFAULT_SCROLLS];
  }
}
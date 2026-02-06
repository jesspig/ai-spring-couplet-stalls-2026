import {
  UPPER_COUPLET_SYSTEM_PROMPT,
  buildUpperCoupletPrompt,
  LOWER_COUPLET_SYSTEM_PROMPT,
  buildLowerCoupletPrompt
} from '../../config/prompts';
import { parseLLMJson } from '../../utils/json-parser.util';
import type { TopicAnalysisResult } from '../../types/spring.types';
import type { ApiService } from '../llm/api.service';

/**
 * 对联生成结果
 */
export interface CoupletGenerationResult {
  /** 上联 */
  upperCouplet: string;
  /** 下联 */
  lowerCouplet: string;
}

/**
 * 对联生成器服务
 * 负责生成上联和下联
 */
export class CoupletGeneratorService {
  constructor(private apiService: ApiService, private model: string) {}

  /**
   * 生成上联
   * @param topic 主题
   * @param wordCount 字数
   * @param analysis 主题分析结果
   * @returns 上联
   */
  async generateUpperCouplet(
    topic: string,
    wordCount: string,
    analysis: TopicAnalysisResult
  ): Promise<string> {
    console.log(`  调用LLM：上联生成`);
    const userPrompt = buildUpperCoupletPrompt(topic, wordCount, analysis);
    const content = await this.apiService.chatCompletion(
      this.model,
      [{ role: 'system', content: UPPER_COUPLET_SYSTEM_PROMPT }, { role: 'user', content: userPrompt }],
      0.8,
      500
    );
    const result = parseLLMJson<{ upperCouplet: string }>(content);
    return result.upperCouplet;
  }

  /**
   * 生成下联
   * @param topic 主题
   * @param wordCount 字数
   * @param upperCouplet 上联
   * @param analysis 主题分析结果
   * @returns 下联
   */
  async generateLowerCouplet(
    topic: string,
    wordCount: string,
    upperCouplet: string,
    analysis: TopicAnalysisResult
  ): Promise<string> {
    console.log(`  调用LLM：下联生成`);
    const userPrompt = buildLowerCoupletPrompt(topic, wordCount, upperCouplet, analysis);
    const content = await this.apiService.chatCompletion(
      this.model,
      [{ role: 'system', content: LOWER_COUPLET_SYSTEM_PROMPT }, { role: 'user', content: userPrompt }],
      0.8,
      500
    );
    const result = parseLLMJson<{ lowerCouplet: string }>(content);
    return result.lowerCouplet;
  }

  /**
   * 生成一副对联
   * @param topic 主题
   * @param wordCount 字数
   * @param analysis 主题分析结果
   * @returns 对联生成结果
   */
  async generateCouplet(
    topic: string,
    wordCount: string,
    analysis: TopicAnalysisResult
  ): Promise<CoupletGenerationResult> {
    const upperCouplet = await this.generateUpperCouplet(topic, wordCount, analysis);
    const lowerCouplet = await this.generateLowerCouplet(topic, wordCount, upperCouplet, analysis);
    return { upperCouplet, lowerCouplet };
  }
}
import {
  TOPIC_ANALYSIS_SYSTEM_PROMPT,
  buildTopicAnalysisPrompt,
  SPRING_GENERATION_SYSTEM_PROMPT,
  buildGenerationPrompt,
  REVIEW_SYSTEM_PROMPT,
  buildReviewPrompt
} from "../config/prompts";
import { parseLLMJson } from "../utils/json-parser.util";
import type {
  TopicAnalysisResult,
  SpringFestivalResponse,
  WorkflowResponse,
  ReviewResult
} from "../types/spring.types";

/**
 * LLM调用配置
 */
interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

/**
 * 春联生成工作流服务
 * 实现三阶段工作流：主题分析 → 春联生成 → 质量审查
 */
export class SpringWorkflowService {
  private config: LLMConfig;

  constructor(baseUrl: string, apiKey: string, model: string) {
    const trimmedUrl = baseUrl.replace(/\/$/, "");
    this.config = {
      baseUrl: trimmedUrl.endsWith("/v1") ? trimmedUrl.slice(0, -3) : trimmedUrl,
      apiKey,
      model
    };
  }

  /**
   * 执行完整的三阶段工作流
   * @param topic 用户输入的主题
   * @param wordCount 春联字数（5、7、9）
   * @param includeAnalysis 是否在响应中包含分析结果
   * @returns 春联生成结果
   */
  async executeWorkflow(
    topic: string,
    wordCount: string,
    includeAnalysis = false
  ): Promise<WorkflowResponse> {
    const maxAttempts = 3;
    let attempt = 0;
    let lastErrors: string[] = [];

    while (attempt < maxAttempts) {
      attempt++;

      console.log(`\n=== 尝试 ${attempt}/${maxAttempts} ===`);

      const analysis = await this.analyzeTopic(topic, wordCount);
      console.log('✓ 主题分析完成');

      const springFestival = await this.generateSpringFestival(
        topic,
        wordCount,
        analysis,
        lastErrors.length > 0 ? lastErrors : undefined
      );
      console.log('✓ 春联生成完成');
      console.log(`  上联：${springFestival.upperCouplet}`);
      console.log(`  下联：${springFestival.lowerCouplet}`);

      const review = await this.reviewSpringFestival(topic, wordCount, springFestival);
      console.log('✓ 质量审查完成');

      if (review.passed) {
        console.log('✓ 审查通过！');

        const result: WorkflowResponse = {
          ...springFestival
        };

        if (includeAnalysis) {
          result.analysis = analysis;
        }

        return result;
      }

      console.log('✗ 审查未通过');
      console.log('  错误信息：', review.errors.map(e => e.message));

      lastErrors = review.errors.map(e => e.message);
    }

    throw new Error(`春联生成失败：经过${maxAttempts}次尝试仍未通过审查`);
  }

  /**
   * 阶段1：分析主题并生成结构化提示词
   * @param topic 用户输入的主题
   * @param wordCount 春联字数
   * @returns 主题分析结果
   */
  async analyzeTopic(topic: string, wordCount: string): Promise<TopicAnalysisResult> {
    const userPrompt = buildTopicAnalysisPrompt(topic, wordCount);
    const content = await this.callLLM(TOPIC_ANALYSIS_SYSTEM_PROMPT, userPrompt, 0.7);

    return parseLLMJson<TopicAnalysisResult>(content);
  }

  /**
   * 阶段2：基于分析结果生成春联
   * @param topic 原始主题
   * @param wordCount 春联字数
   * @param analysis 主题分析结果
   * @param previousErrors 之前的错误信息（用于改进）
   * @returns 春联生成结果
   */
  async generateSpringFestival(
    topic: string,
    wordCount: string,
    analysis: TopicAnalysisResult,
    previousErrors?: string[]
  ): Promise<SpringFestivalResponse> {
    const userPrompt = buildGenerationPrompt(topic, wordCount, analysis, previousErrors);
    const content = await this.callLLM(SPRING_GENERATION_SYSTEM_PROMPT, userPrompt, 0.8);

    const result = parseLLMJson<SpringFestivalResponse>(content);

    if (!result.upperCouplet || !result.lowerCouplet ||
        !result.horizontalScroll || !Array.isArray(result.springScrolls)) {
      throw new Error("LLM返回的数据结构不完整");
    }

    return result;
  }

  /**
   * 阶段3：审查春联质量
   * @param topic 原始主题
   * @param wordCount 春联字数
   * @param result 春联生成结果
   * @returns 审查结果
   */
  async reviewSpringFestival(
    topic: string,
    wordCount: string,
    result: SpringFestivalResponse
  ): Promise<ReviewResult> {
    const userPrompt = buildReviewPrompt(topic, wordCount, result);
    const content = await this.callLLM(REVIEW_SYSTEM_PROMPT, userPrompt, 0.3);

    const reviewResult = parseLLMJson<ReviewResult>(content);

    if (typeof reviewResult.passed !== "boolean") {
      throw new Error("审查结果缺少passed字段");
    }

    return reviewResult;
  }

  /**
   * 调用LLM API
   * @param systemPrompt 系统提示词
   * @param userPrompt 用户提示词
   * @param temperature 温度参数
   * @returns LLM返回的文本内容
   */
  private async callLLM(
    systemPrompt: string,
    userPrompt: string,
    temperature: number
  ): Promise<string> {
    const url = `${this.config.baseUrl}/v1/chat/completions`;

    console.log(`  调用 LLM: ${this.config.model} (temperature: ${temperature})`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("LLM返回内容为空");
    }

    return content;
  }
}

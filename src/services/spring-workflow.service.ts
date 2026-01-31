import {
  TOPIC_ANALYSIS_SYSTEM_PROMPT,
  buildTopicAnalysisPrompt,
  SPRING_GENERATION_SYSTEM_PROMPT,
  buildGenerationPrompt,
  REVIEW_SYSTEM_PROMPT,
  buildReviewPrompt,
  type TopicAnalysisResult,
  type SpringFestivalResponse,
  type WorkflowResponse,
  type ReviewResult
} from "../config/prompts.config";

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
 * 实现两阶段工作流：主题分析 → 春联生成
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
   * @param includeAnalysis 是否在响应中包含分析结果
   * @param wordCount 对联字数（5、7、9）
   * @returns 春联生成结果
   */
  async executeWorkflow(
    topic: string,
    includeAnalysis = false,
    wordCount = '7'
  ): Promise<WorkflowResponse> {
    const maxAttempts = 3;
    let attempt = 0;
    let lastErrors: string[] = [];
    let lastResult: SpringFestivalResponse | undefined;
    let lastReview: ReviewResult | undefined;
    let previousResults: SpringFestivalResponse[] = [];
    let previousReviews: ReviewResult[] = [];

    while (attempt < maxAttempts) {
      attempt++;

      console.log(`\n[工作流] 开始第 ${attempt}/${maxAttempts} 次尝试`);

      const analysis = await this.analyzeTopic(topic);

      const springFestival = await this.generateSpringFestival(
        topic,
        analysis,
        lastErrors.length > 0 ? lastErrors : undefined,
        lastResult,
        lastReview,
        wordCount
      );

      const review = await this.reviewSpringFestival(
        topic,
        springFestival,
        previousResults,
        previousReviews,
        wordCount
      );

      console.log(`[工作流] 第 ${attempt} 次审查结果: ${review.passed ? '通过' : '未通过'}`);

      previousResults.push(springFestival);
      previousReviews.push(review);

      if (review.passed) {
        const result: WorkflowResponse = {
          ...springFestival
        };

        if (includeAnalysis) {
          result.analysis = analysis;
        }

        console.log(`[工作流] 成功生成春联，共尝试 ${attempt} 次`);
        return result;
      }

      lastErrors = review.errors.map(e => e.message);
      lastResult = springFestival;
      lastReview = review;
    }

    throw new Error(`春联生成失败：经过${maxAttempts}次尝试仍未通过审查`);
  }

  /**
   * 阶段1：分析主题并生成结构化提示词
   * @param topic 用户输入的主题
   * @returns 主题分析结果
   */
  async analyzeTopic(topic: string): Promise<TopicAnalysisResult> {
    const userPrompt = buildTopicAnalysisPrompt(topic);
    const content = await this.callLLM(TOPIC_ANALYSIS_SYSTEM_PROMPT, userPrompt, 0.7);

    return this.parseAnalysisResult(content);
  }

  /**
   * 阶段2：基于分析结果生成春联
   * @param topic 原始主题
   * @param analysis 主题分析结果
   * @param previousErrors 之前的错误信息（用于改进）
   * @param previousResult 上一次生成的春联内容（用于参考和改进）
   * @param previousReview 上一次的审查结果（用于了解具体问题）
   * @param wordCount 对联字数（5、7、9）
   * @returns 春联生成结果
   */
  async generateSpringFestival(
    topic: string,
    analysis: TopicAnalysisResult,
    previousErrors?: string[],
    previousResult?: SpringFestivalResponse,
    previousReview?: ReviewResult,
    wordCount = '7'
  ): Promise<SpringFestivalResponse> {
    const userPrompt = buildGenerationPrompt(
      topic,
      analysis,
      previousErrors,
      previousResult,
      previousReview,
      wordCount
    );
    const content = await this.callLLM(SPRING_GENERATION_SYSTEM_PROMPT, userPrompt, 0.8);

    return this.parseSpringResult(content);
  }

  /**
   * 阶段3：审查春联质量
   * @param topic 原始主题
   * @param result 春联生成结果
   * @param previousResults 之前生成的春联内容（用于参考）
   * @param previousReviews 之前的审查结果（用于保持一致性）
   * @param wordCount 对联字数（5、7、9）
   * @returns 审查结果
   */
  async reviewSpringFestival(
    topic: string,
    result: SpringFestivalResponse,
    previousResults?: SpringFestivalResponse[],
    previousReviews?: ReviewResult[],
    wordCount = '7'
  ): Promise<ReviewResult> {
    console.log(`[工作流] 审查历史记录数量: ${previousResults?.length || 0}`);
    const userPrompt = buildReviewPrompt(
      topic,
      result,
      previousResults,
      previousReviews,
      wordCount
    );
    const content = await this.callLLM(REVIEW_SYSTEM_PROMPT, userPrompt, 0.3);

    return this.parseReviewResult(content);
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

    // 构建请求体
    const requestBody = {
      model: this.config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature,
      max_tokens: 800
    };

    // 输出请求信息
    console.log("\n[LLM请求] ==========================================");
    console.log(`[LLM请求] URL: ${url}`);
    console.log(`[LLM请求] Model: ${this.config.model}`);
    console.log(`[LLM请求] Temperature: ${temperature}`);
    console.log(`[LLM请求] SystemPrompt长度: ${systemPrompt.length} 字符`);
    console.log(`[LLM请求] UserPrompt长度: ${userPrompt.length} 字符`);
    console.log("[LLM请求] Request Body:");
    console.log(JSON.stringify(requestBody, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[LLM响应] 请求失败: ${response.status} ${errorText}`);
      throw new Error(`LLM请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };
    const content = data.choices?.[0]?.message?.content;

    // 输出响应信息
    console.log("\n[LLM响应] ==========================================");
    if (data.usage) {
      console.log(`[LLM响应] Token使用: prompt=${data.usage.prompt_tokens}, completion=${data.usage.completion_tokens}, total=${data.usage.total_tokens}`);
    }
    console.log("[LLM响应] Content:");
    console.log(content);
    console.log("[LLM响应] ==========================================\n");

    if (!content) {
      throw new Error("LLM返回内容为空");
    }

    return content;
  }

  /**
   * 解析主题分析结果
   * @param content LLM返回的文本
   * @returns 解析后的分析结果
   */
  private parseAnalysisResult(content: string): TopicAnalysisResult {
    try {
      // 尝试直接解析
      return JSON.parse(content) as TopicAnalysisResult;
    } catch {
      // 尝试从markdown代码块中提取
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) ||
                        content.match(/```\s*([\s\S]*?)```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim()) as TopicAnalysisResult;
      }

      // 尝试提取花括号内的内容
      const braceMatch = content.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        return JSON.parse(braceMatch[0]) as TopicAnalysisResult;
      }

      throw new Error("无法解析主题分析结果");
    }
  }

  /**
   * 解析春联生成结果
   * @param content LLM返回的文本
   * @returns 解析后的春联结果
   */
  private parseSpringResult(content: string): SpringFestivalResponse {
    let result: SpringFestivalResponse;

    try {
      // 尝试直接解析
      result = JSON.parse(content) as SpringFestivalResponse;
    } catch {
      // 尝试从markdown代码块中提取
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) ||
                        content.match(/```\s*([\s\S]*?)```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1].trim()) as SpringFestivalResponse;
      } else {
        // 尝试提取花括号内的内容
        const braceMatch = content.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          result = JSON.parse(braceMatch[0]) as SpringFestivalResponse;
        } else {
          throw new Error("无法解析LLM返回的JSON");
        }
      }
    }

    // 验证响应结构
    if (!result.upperCouplet || !result.lowerCouplet ||
        !result.horizontalScroll || !Array.isArray(result.springScrolls)) {
      throw new Error("LLM返回的数据结构不完整");
    }

    return result;
  }

  /**
   * 解析审查结果
   * @param content LLM返回的文本
   * @returns 解析后的审查结果
   */
  private parseReviewResult(content: string): ReviewResult {
    let result: ReviewResult;

    try {
      result = JSON.parse(content) as ReviewResult;
    } catch {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) ||
                        content.match(/```\s*([\s\S]*?)```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1].trim()) as ReviewResult;
      } else {
        const braceMatch = content.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          result = JSON.parse(braceMatch[0]) as ReviewResult;
        } else {
          throw new Error("无法解析审查结果");
        }
      }
    }

    if (typeof result.passed !== "boolean") {
      throw new Error("审查结果缺少passed字段");
    }

    return result;
  }
}

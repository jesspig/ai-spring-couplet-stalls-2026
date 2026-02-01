import {
  TOPIC_ANALYSIS_SYSTEM_PROMPT,
  buildTopicAnalysisPrompt,
  SPRING_GENERATION_SYSTEM_PROMPT,
  buildGenerationPrompt,
  REVIEW_SYSTEM_PROMPT,
  buildReviewPrompt,
  ELECTION_SYSTEM_PROMPT,
  buildElectionPrompt,
  type GenerationHistory,
  type ReviewHistory
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
 * 错误分类类型
 */
type ErrorCategory = "format" | "pingze" | "duizhang" | "content" | "other";

/**
 * 分类错误信息
 * @param errorMessage 错误消息
 * @returns 错误分类
 */
function categorizeError(errorMessage: string): ErrorCategory {
  const message = errorMessage.toLowerCase();
  if (message.includes("字数") || message.includes("格式") || message.includes("json")) {
    return "format";
  }
  if (message.includes("平仄") || message.includes("声") || message.includes("音")) {
    return "pingze";
  }
  if (message.includes("对仗") || message.includes("词性") || message.includes("结构")) {
    return "duizhang";
  }
  if (message.includes("错别") || message.includes("语法") || message.includes("用词")) {
    return "content";
  }
  return "other";
}

/**
 * 验证春联字数是否符合要求
 * @param result 春联生成结果
 * @param expectedWordCount 期望的字数
 * @returns 验证结果，通过返回null，不通过返回错误信息
 */
function validateWordCount(
  result: SpringFestivalResponse,
  expectedWordCount: string
): string | null {
  const expected = parseInt(expectedWordCount, 10);

  if (isNaN(expected)) {
    return `字数要求格式错误：${expectedWordCount}`;
  }

  const upperLength = result.upperCouplet.length;
  const lowerLength = result.lowerCouplet.length;

  if (upperLength !== expected) {
    return `上联字数错误：要求${expected}字，实际${upperLength}字"${result.upperCouplet}"`;
  }

  if (lowerLength !== expected) {
    return `下联字数错误：要求${expected}字，实际${lowerLength}字"${result.lowerCouplet}"`;
  }

  if (upperLength !== lowerLength) {
    return `上下联字数不相等：上联${upperLength}字，下联${lowerLength}字`;
  }

  return null;
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
   * @param formData 表单信息（用于回退时恢复）
   * @returns 春联生成结果
   */
  async executeWorkflow(
    topic: string,
    wordCount: string,
    includeAnalysis = false,
    formData?: { coupletOrder: 'upper-lower' | 'lower-upper'; horizontalDirection: 'left-right' | 'right-left'; fuDirection: 'upright' | 'rotated' }
  ): Promise<WorkflowResponse> {
    const maxAttempts = 5;
    let attempt = 0;
    const generationHistory: GenerationHistory[] = [];
    const reviewHistory: ReviewHistory[] = [];

    console.log(`\n=== 开始春联生成工作流 ===`);
    console.log(`主题：${topic}`);
    console.log(`字数：${wordCount}字`);

    while (attempt < maxAttempts) {
      attempt++;

      console.log(`\n=== 尝试 ${attempt}/${maxAttempts} ===`);

      try {
        const analysis = await this.analyzeTopic(topic, wordCount);
        console.log("✓ 主题分析完成");

        const springFestival = await this.generateSpringFestival(
          topic,
          wordCount,
          analysis,
          generationHistory
        );
        console.log("✓ 春联生成完成");
        console.log(`  上联：${springFestival.upperCouplet}`);
        console.log(`  下联：${springFestival.lowerCouplet}`);

        const wordCountError = validateWordCount(springFestival, wordCount);
        if (wordCountError) {
          console.log("✗ 程序字数验证未通过");
          console.log(`  错误：${wordCountError}`);

          const errorCategories = ["format"];
          const reviewResult = {
            passed: false,
            errors: [{ type: "字数错误", message: wordCountError }],
            suggestions: ["必须严格按照要求的字数生成，上联和下联字数必须相等"]
          };

          generationHistory.push({
            attempt,
            ...springFestival,
            reviewResult,
            errorCategories
          });
          reviewHistory.push({
            attempt,
            ...springFestival,
            reviewResult,
            errorCategories
          });

          continue;
        }

        console.log("✓ 程序字数验证通过");

        const review = await this.reviewSpringFestival(
          topic,
          wordCount,
          springFestival,
          reviewHistory
        );
        console.log("✓ 质量审查完成");

        const errorCategories = review.errors.map(e => categorizeError(e.message));

        generationHistory.push({
          attempt,
          ...springFestival,
          reviewResult: review,
          errorCategories
        });
        reviewHistory.push({
          attempt,
          ...springFestival,
          reviewResult: review,
          errorCategories
        });

        if (review.passed) {
          console.log("✓ 审查通过！");
          console.log(`\n=== 春联生成成功（第${attempt}次尝试）===`);

          const result: WorkflowResponse = {
            ...springFestival
          };

          if (includeAnalysis) {
            result.analysis = analysis;
          }

          return result;
        }

        console.log("✗ 审查未通过");
        console.log("  错误分类：", errorCategories);
        console.log("  错误详情：", review.errors.map(e => `[${e.type}] ${e.message}`));

        if (review.suggestions.length > 0) {
          console.log("  改进建议：", review.suggestions);
        }

      } catch (error) {
        console.error(`✗ 第${attempt}次尝试发生错误:`, error);
        if (attempt === maxAttempts) {
          throw error;
        }
      }
    }

    console.log(`\n=== 春联生成失败 ===`);
    console.log("历史记录：", JSON.stringify(generationHistory, null, 2));

    const candidates = generationHistory.filter(h => !h.reviewResult.passed);

    if (candidates.length > 0) {
      // 检查是否有单数字数的候选（5/7/9字）
      const singleDigitCandidates = candidates.filter(h => {
        const upperLength = h.upperCouplet.length;
        return upperLength === 5 || upperLength === 7 || upperLength === 9;
      });

      console.log(`\n=== 触发选举机制 ===`);
      console.log(`候选数量：${candidates.length}个`);
      console.log(`单数字数候选：${singleDigitCandidates.length}个`);

      // 如果没有单数字数的候选，回退到首页
      if (singleDigitCandidates.length === 0) {
        console.log("✗ 没有单数字数的候选，回退到首页");

        const result: WorkflowResponse = {
          upperCouplet: '',
          lowerCouplet: '',
          horizontalScroll: '',
          springScrolls: [],
          shouldReturnToHome: true,
          formData: {
            topic,
            wordCount,
            coupletOrder: formData?.coupletOrder || 'upper-lower',
            horizontalDirection: formData?.horizontalDirection || 'left-right',
            fuDirection: formData?.fuDirection || 'upright'
          },
          errorMessage: '未能生成符合要求的单数字数对联（5/7/9字），请调整主题或字数后重试。'
        };

        return result;
      }

      // 优先从单数字数候选中选举
      const electionCandidates = singleDigitCandidates.length > 0 ? singleDigitCandidates : candidates;
      const electionResult = await this.electBestCandidate(electionCandidates, wordCount);

      console.log("✓ 选举完成");
      console.log(`  选中索引：${electionResult.selectedIndex}`);
      console.log(`  选择理由：${electionResult.reason}`);

      const selectedCandidate = electionCandidates[electionResult.selectedIndex];

      const result: WorkflowResponse = {
        ...selectedCandidate
      };

      if (includeAnalysis) {
        result.analysis = await this.analyzeTopic(topic, wordCount);
      }

      return result;
    }

    throw new Error(`春联生成失败：经过${maxAttempts}次尝试仍未通过审查。主要问题：${this.summarizeHistoryErrors(generationHistory)}`);
  }

  /**
   * 汇总历史错误
   * @param generationHistory 生成历史记录
   * @returns 错误摘要
   */
  private summarizeHistoryErrors(generationHistory: GenerationHistory[]): string {
    const categoryCount: Record<ErrorCategory, number> = {
      format: 0,
      pingze: 0,
      duizhang: 0,
      content: 0,
      other: 0
    };

    generationHistory.forEach(h => {
      h.errorCategories.forEach(c => {
        categoryCount[c]++;
      });
    });

    const mainIssues = Object.entries(categoryCount)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([cat]) => {
        const map: Record<ErrorCategory, string> = {
          format: "格式错误",
          pingze: "平仄不合规",
          duizhang: "对仗不工整",
          content: "内容问题",
          other: "其他问题"
        };
        return map[cat];
      });

    return mainIssues.join("、") || "未知错误";
  }

  /**
   * 选举最优候选春联
   * @param candidates 候选春联列表
   * @param wordCount 要求的字数
   * @returns 选举结果
   */
  private async electBestCandidate(
    candidates: Array<{
      upperCouplet: string;
      lowerCouplet: string;
      horizontalScroll: string;
      springScrolls: string[];
    }>,
    wordCount: string
  ): Promise<{ selectedIndex: number; reason: string }> {
    const userPrompt = buildElectionPrompt(candidates, wordCount);
    const content = await this.callLLM(ELECTION_SYSTEM_PROMPT, userPrompt, 0.3);

    const electionResult = JSON.parse(content) as { selectedIndex: number; reason: string };

    if (typeof electionResult.selectedIndex !== "number") {
      throw new Error("选举结果缺少selectedIndex字段");
    }

    if (electionResult.selectedIndex < 0 || electionResult.selectedIndex >= candidates.length) {
      throw new Error(`选举索引超出范围：${electionResult.selectedIndex}`);
    }

    return electionResult;
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
        max_tokens: 1200
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

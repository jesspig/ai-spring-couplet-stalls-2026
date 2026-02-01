import {
  TOPIC_ANALYSIS_SYSTEM_PROMPT,
  buildTopicAnalysisPrompt,
  UPPER_COUPLET_SYSTEM_PROMPT,
  buildUpperCoupletPrompt,
  LOWER_COUPLET_SYSTEM_PROMPT,
  buildLowerCoupletPrompt,
  SPRING_SCROLLS_SYSTEM_PROMPT,
  buildSpringScrollsPrompt,
  ELECTION_SYSTEM_PROMPT,
  buildElectionPrompt
} from "../config/prompts";
import { parseLLMJson } from "../utils/json-parser.util";
import type {
  TopicAnalysisResult,
  SpringFestivalResponse,
  WorkflowResponse,
  GenerationHistory
} from "../types/spring.types";

interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

/**
 * 验证字数
 */
function validateWordCount(text: string, expected: number): string | null {
  if (text.length !== expected) {
    return `字数错误：要求${expected}字，实际${text.length}字"${text}"`;
  }
  return null;
}

/**
 * 验证声调
 */
function validateTone(text: string, isUpper: boolean): string | null {
  const lastChar = text.slice(-1);
  const tone = getTone(lastChar);
  
  if (isUpper) {
    if (tone === 1 || tone === 2) {
      return `上联末字"${lastChar}"为平声（${tone}声），应为仄声（3/4声）`;
    }
  } else {
    if (tone === 3 || tone === 4) {
      return `下联末字"${lastChar}"为仄声（${tone}声），应为平声（1/2声）`;
    }
  }
  return null;
}

/**
 * 获取汉字声调
 */
function getTone(char: string): number {
  const pinyinMap: Record<string, number> = {
    '天': 1, '春': 1, '风': 1, '花': 1, '开': 1, '家': 1, '福': 1, '祥': 1, '龙': 2, '鹏': 2, '程': 2, '图': 2, '金': 1, '银': 2, '年': 2, '人': 2,
    '水': 3, '火': 3, '土': 3, '雨': 3, '雪': 3, '海': 3, '鸟': 3, '马': 3, '草': 3, '手': 3, '走': 3, '友': 3, '有': 3, '酒': 3, '久': 3,
    '日': 4, '月': 4, '木': 4, '石': 4, '玉': 4, '路': 4, '树': 4, '去': 4, '住': 4, '处': 4, '事': 4, '世': 4, '业': 4, '意': 4
  };
  
  return pinyinMap[char] || 1;
}

export class SpringWorkflowService {
  private config: LLMConfig;

  constructor(baseUrl: string, apiKey: string, model: string) {
    this.config = {
      baseUrl: baseUrl.replace(/\/$/, ""),
      apiKey,
      model
    };
  }

  async executeWorkflow(
    topic: string,
    wordCount: string,
    includeAnalysis = false,
    formData?: { coupletOrder: 'upper-lower' | 'lower-upper'; horizontalDirection: 'left-right' | 'right-left'; fuDirection: 'upright' | 'rotated' }
  ): Promise<WorkflowResponse> {
    const maxAttempts = 5;
    const history: GenerationHistory[] = [];
    const expectedCount = parseInt(wordCount, 10);

    console.log(`\n=== 开始春联生成工作流 ===`);
    console.log(`主题：${topic}，字数：${wordCount}`);

    const analysis = await this.analyzeTopic(topic, wordCount);
    console.log("✓ 主题分析完成");

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`\n=== 尝试 ${attempt}/${maxAttempts} ===`);

      try {
        const upperCouplet = await this.generateUpperCouplet(topic, wordCount, analysis);
        const upperWordError = validateWordCount(upperCouplet, expectedCount);
        if (upperWordError) {
          console.log(`✗ 上联${upperWordError}`);
          continue;
        }

        const lowerCouplet = await this.generateLowerCouplet(topic, wordCount, upperCouplet, analysis);
        const lowerWordError = validateWordCount(lowerCouplet, expectedCount);
        if (lowerWordError) {
          console.log(`✗ 下联${lowerWordError}`);
          continue;
        }

        history.push({
          attempt,
          upperCouplet,
          lowerCouplet
        });

        const springScrolls = await this.generateSpringScrolls(topic, upperCouplet, lowerCouplet, analysis);
        
        const scrollErrors = springScrolls.map(s => validateWordCount(s, 4)).filter(e => e);
        if (scrollErrors.length > 0) {
          console.log(`✗ 挥春字数错误：${scrollErrors.join('; ')}`);
          continue;
        }

        console.log("✓ 挥春生成完成");
        
        const result: WorkflowResponse = {
          upperCouplet,
          lowerCouplet,
          horizontalScroll: this.generateHorizontalScroll(topic, analysis),
          springScrolls
        };

        if (includeAnalysis) {
          result.analysis = analysis;
        }

        return result;

      } catch (error) {
        console.error(`✗ 第${attempt}次尝试失败:`, error);
      }
    }

    if (history.length > 0) {
      console.log("\n=== 触发选举机制 ===");
      const best = await this.electBestCandidate(history, wordCount);
      const springScrolls = await this.generateSpringScrolls(topic, best.upperCouplet, best.lowerCouplet, analysis);

      const result: WorkflowResponse = {
        upperCouplet: best.upperCouplet,
        lowerCouplet: best.lowerCouplet,
        horizontalScroll: this.generateHorizontalScroll(topic, analysis),
        springScrolls
      };

      if (includeAnalysis) {
        result.analysis = analysis;
      }

      return result;
    }

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
      errorMessage: '未能生成符合要求的春联，请调整主题后重试。'
    };

    return result;
  }

  private async analyzeTopic(topic: string, wordCount: string): Promise<TopicAnalysisResult> {
    const userPrompt = buildTopicAnalysisPrompt(topic, wordCount);
    const content = await this.callLLM(TOPIC_ANALYSIS_SYSTEM_PROMPT, userPrompt, 0.7);
    return content.trim();
  }

  private async generateUpperCouplet(
    topic: string,
    wordCount: string,
    analysis: TopicAnalysisResult
  ): Promise<string> {
    const userPrompt = buildUpperCoupletPrompt(topic, wordCount, analysis);
    const content = await this.callLLM(UPPER_COUPLET_SYSTEM_PROMPT, userPrompt, 0.8);
    const result = parseLLMJson<{ upperCouplet: string }>(content);
    return result.upperCouplet;
  }

  private async generateLowerCouplet(
    topic: string,
    wordCount: string,
    upperCouplet: string,
    analysis: TopicAnalysisResult
  ): Promise<string> {
    const userPrompt = buildLowerCoupletPrompt(topic, wordCount, upperCouplet, analysis);
    const content = await this.callLLM(LOWER_COUPLET_SYSTEM_PROMPT, userPrompt, 0.8);
    const result = parseLLMJson<{ lowerCouplet: string }>(content);
    return result.lowerCouplet;
  }

  private async generateSpringScrolls(
    topic: string,
    upperCouplet: string,
    lowerCouplet: string,
    analysis: TopicAnalysisResult
  ): Promise<string[]> {
    const userPrompt = buildSpringScrollsPrompt(topic, upperCouplet, lowerCouplet, analysis);
    const content = await this.callLLM(SPRING_SCROLLS_SYSTEM_PROMPT, userPrompt, 0.8);
    const result = parseLLMJson<{ springScrolls: string[] }>(content);
    return result.springScrolls;
  }

  private generateHorizontalScroll(topic: string, analysis: TopicAnalysisResult): string {
    const commonScrolls = ['万事如意', '前程似锦', '阖家欢乐', '马到成功', '春满人间'];
    return commonScrolls[Math.floor(Math.random() * commonScrolls.length)];
  }

  private async electBestCandidate(
    history: GenerationHistory[],
    wordCount: string
  ): Promise<{ upperCouplet: string; lowerCouplet: string }> {
    const candidates = history.filter(h => h.upperCouplet.length === parseInt(wordCount) && h.lowerCouplet.length === parseInt(wordCount));
    
    if (candidates.length === 0) {
      return { upperCouplet: history[0].upperCouplet, lowerCouplet: history[0].lowerCouplet };
    }

    const userPrompt = buildElectionPrompt(candidates, wordCount);
    const content = await this.callLLM(ELECTION_SYSTEM_PROMPT, userPrompt, 0.3);
    const result = JSON.parse(content) as { selectedIndex: number; reason: string };

    const selected = candidates[result.selectedIndex] || candidates[0];
    return { upperCouplet: selected.upperCouplet, lowerCouplet: selected.lowerCouplet };
  }

  private async callLLM(
    systemPrompt: string,
    userPrompt: string,
    temperature: number
  ): Promise<string> {
    const url = `${this.config.baseUrl}/chat/completions`;

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
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`LLM请求失败: ${response.status}`);
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

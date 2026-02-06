import {
  ELECTION_SYSTEM_PROMPT,
  buildElectionPrompt
} from '../../config/prompts';
import { parseLLMJson } from '../../utils/json-parser.util';
import type { ApiService } from '../llm/api.service';

/**
 * 生成历史记录
 */
export interface GenerationHistory {
  /** 尝试次数 */
  attempt: number;
  /** 上联 */
  upperCouplet: string;
  /** 下联 */
  lowerCouplet: string;
}

/**
 * 选举结果
 */
export interface ElectionResult {
  /** 上联 */
  upperCouplet: string;
  /** 下联 */
  lowerCouplet: string;
  /** 选中的索引 */
  selectedIndex: number;
  /** 选择理由 */
  reason: string;
}

/**
 * 选举服务
 * 从多个候选中选择最佳对联
 */
export class ElectionService {
  constructor(private apiService: ApiService, private model: string) {}

  /**
   * 从候选中选择最佳对联
   * @param history 生成历史记录
   * @param wordCount 字数
   * @returns 最佳对联及选择信息
   */
  async selectBestCouplet(
    history: GenerationHistory[],
    wordCount: string
  ): Promise<ElectionResult> {
    const candidates = history.filter(h => 
      h.upperCouplet.length === parseInt(wordCount) && 
      h.lowerCouplet.length === parseInt(wordCount)
    );

    if (candidates.length === 0) {
      return {
        upperCouplet: history[0].upperCouplet,
        lowerCouplet: history[0].lowerCouplet,
        selectedIndex: 0,
        reason: '无符合字数要求的候选，选择第一个'
      };
    }

    if (candidates.length === 1) {
      return {
        upperCouplet: candidates[0].upperCouplet,
        lowerCouplet: candidates[0].lowerCouplet,
        selectedIndex: history.indexOf(candidates[0]),
        reason: '只有一个符合字数要求的候选'
      };
    }

    // 使用 LLM 进行选举
    const candidateText = candidates.map((c, i) => 
      `${i + 1}. 上联：${c.upperCouplet}\n   下联：${c.lowerCouplet}`
    ).join('\n\n');

    const userPrompt = buildElectionPrompt(wordCount, candidateText);
    const content = await this.apiService.chatCompletion(
      this.model,
      [{ role: 'system', content: ELECTION_SYSTEM_PROMPT }, { role: 'user', content: userPrompt }],
      0.7,
      1000
    );

    const result = parseLLMJson<{ selectedIndex: number; reason: string }>(content);
    const selectedCandidate = candidates[result.selectedIndex - 1];

    return {
      upperCouplet: selectedCandidate.upperCouplet,
      lowerCouplet: selectedCandidate.lowerCouplet,
      selectedIndex: history.indexOf(selectedCandidate),
      reason: result.reason
    };
  }
}

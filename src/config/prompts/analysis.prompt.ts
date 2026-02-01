/**
 * 阶段1：主题分析提示词配置
 * 精简版，生成创作指导
 */

export const TOPIC_ANALYSIS_SYSTEM_PROMPT = `分析主题，生成春联创作指导。`;

export function buildTopicAnalysisPrompt(topic: string, wordCount: string = '7'): string {
  const wordCountText = wordCount === '5' ? '五言' : wordCount === '7' ? '七言' : '九言';
  return `为主题"${topic}"生成${wordCountText}春联创作指导。

要求：50字以内，包含主题核心、文化意象、情感基调。

输出一段话。`;
}

/**
 * 阶段3：下联生成提示词
 * 精简版，根据上联生成下联
 */

export const LOWER_COUPLET_SYSTEM_PROMPT = `根据上联生成下联。输出JSON。`;

export function buildLowerCoupletPrompt(
  topic: string,
  wordCount: string,
  upperCouplet: string,
  analysis: string
): string {
  const wordCountText = wordCount === '5' ? '五言' : wordCount === '7' ? '七言' : '九言';
  return `根据上联生成${wordCountText}下联。

年份信息：2026丙午马年

## 上联
${upperCouplet}

## 创作指导
${analysis}

## 要求
1. 字数严格${wordCount}字
2. 末字平声（一/二声）
3. 与上联对仗（词性、结构）
4. 意思互补，避免合掌

## 输出JSON
{"lowerCouplet":"下联内容（严格${wordCount}字）"}`;
}

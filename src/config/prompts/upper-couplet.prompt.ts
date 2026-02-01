/**
 * 阶段2：上联生成提示词
 * 精简版，只生成上联
 */

export const UPPER_COUPLET_SYSTEM_PROMPT = `生成春联上联。输出JSON。`;

export function buildUpperCoupletPrompt(
  topic: string,
  wordCount: string,
  analysis: string
): string {
  const wordCountText = wordCount === '5' ? '五言' : wordCount === '7' ? '七言' : '九言';
  return `为主题"${topic}"生成${wordCountText}上联。

## 创作指导
${analysis}

## 要求
1. 字数严格${wordCount}字
2. 末字仄声（三/四声）
3. 语言通顺自然
4. 寓意吉祥

## 输出JSON
{"upperCouplet":"上联内容（严格${wordCount}字）"}`;
}

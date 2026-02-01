/**
 * 阶段4：格式审查提示词
 * 宽松标准，只审查通顺和对仗
 */

export const FORMAT_REVIEW_SYSTEM_PROMPT = `审查春联格式。输出JSON。`;

export function buildFormatReviewPrompt(
  topic: string,
  wordCount: string,
  upperCouplet: string,
  lowerCouplet: string
): string {
  return `审查${wordCount}字春联格式。

## 待审查
上联：${upperCouplet}
下联：${lowerCouplet}

## 审查标准（宽松）
1. 通顺自然：语句流畅，符合汉语习惯
2. 对仗基本：词性大致相对，结构大致相应

## 输出JSON
{
  "passed": true/false,
  "errors": [{"type":"错误类型","message":"具体描述"}],
  "suggestions": ["改进建议"]
}

注：只要通顺且基本对仗即可通过，不追求完美。`;
}

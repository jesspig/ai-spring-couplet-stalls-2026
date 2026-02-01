/**
 * 阶段4：横批生成提示词
 * 根据主题、上下联生成相关的横批
 */

export const HORIZONTAL_SCROLL_SYSTEM_PROMPT = `生成横批。输出JSON。`;

export function buildHorizontalScrollPrompt(
  topic: string,
  upperCouplet: string,
  lowerCouplet: string,
  analysis: string
): string {
  return `为主题"${topic}"生成横批。

年份信息：2026丙午马年

## 上下联
上联：${upperCouplet}
下联：${lowerCouplet}

## 创作指导
${analysis}

## 要求
1. 横批严格4字
2. 与上下联内容呼应，统揽全联主题
3. 寓意吉祥，点明主旨
4. 与主题紧密相关

## 输出JSON
{"horizontalScroll":"横批内容"}`;
}

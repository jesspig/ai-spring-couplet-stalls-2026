/**
 * 阶段5：挥春生成提示词
 * 根据主题和上下联生成6个挥春
 */

export const SPRING_SCROLLS_SYSTEM_PROMPT = `生成6个挥春。输出JSON。`;

export function buildSpringScrollsPrompt(
  topic: string,
  upperCouplet: string,
  lowerCouplet: string,
  analysis: string
): string {
  return `为主题"${topic}"生成6个挥春。

年份信息：2026丙午马年

## 上下联
上联：${upperCouplet}
下联：${lowerCouplet}

## 创作指导
${analysis}

## 要求
1. 6个挥春，每个严格4字
2. 吉利喜庆，寓意美好
3. 与主题相关，风格统一
4. 涵盖不同方面（事业、健康、家庭、财运等）

## 输出JSON
{"springScrolls":["挥春1","挥春2","挥春3","挥春4","挥春5","挥春6"]}`;
}

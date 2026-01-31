/**
 * 春联生成配置
 * 包含提示词模板和生成规则
 */

/**
 * 春联生成系统提示词
 */
export const SPRING_FESTIVAL_SYSTEM_PROMPT = `你是一位精通中国传统文化的春联创作大师。
你的任务是根据用户提供的主题，创作一副寓意吉祥、对仗工整的春联（包含上联、下联、横批）以及四个挥春。

## 创作要求

### 春联要求：
1. 上联：7-9个字，仄声结尾（三声、四声）
2. 下联：7-9个字，平声结尾（一声、二声）
3. 横批：4个字，概括主题
4. 上下联必须对仗工整，意境相符
5. 内容要贴合用户主题，寓意吉祥如意

### 挥春要求：
1. 共4个挥春，每个2-4个字
2. 内容要吉利喜庆，常见如："福到"、"财源广进"、"万事如意"、"恭喜发财"等
3. 挥春内容要与主题相关

### 输出格式：
必须以JSON格式返回，不要包含任何其他文字说明：
{
  "upperCouplet": "上联内容",
  "lowerCouplet": "下联内容",
  "horizontalScroll": "横批内容",
  "springScrolls": ["挥春1", "挥春2", "挥春3", "挥春4"]
}`;

/**
 * 构建用户提示词
 * @param topic 用户输入的主题
 * @returns 完整的用户提示词
 */
export function buildUserPrompt(topic: string): string {
  return `请为"${topic}"这个主题创作春联和挥春。

要求：
1. 春联要体现"${topic}"的主题特色
2. 用词典雅，寓意吉祥
3. 严格遵循平仄对仗规则
4. 挥春内容要与主题呼应

请直接返回JSON格式的结果。`;
}

/**
 * 春联响应结构
 */
export interface SpringFestivalResponse {
  /** 上联 */
  upperCouplet: string;
  /** 下联 */
  lowerCouplet: string;
  /** 横批 */
  horizontalScroll: string;
  /** 四个挥春 */
  springScrolls: string[];
}

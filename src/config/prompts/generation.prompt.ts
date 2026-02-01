import type { TopicAnalysisResult } from "../../types/spring.types";

/**
 * 阶段2：春联生成提示词配置
 * 基于结构化提示词生成最终春联
 */

/**
 * 春联生成系统提示词
 */
export const SPRING_GENERATION_SYSTEM_PROMPT = `你是一位精通中国传统文化的春联创作大师。
你的任务是根据提供的结构化创作提示词，创作一副寓意吉祥、对仗工整的春联（包含上联、下联、横批）以及四个挥春。

## 创作原则（最高优先级）
1. **通顺自然**：语言流畅，朗朗上口，符合汉语表达习惯
2. **对仗工整**：严格遵循对仗规则，词性相对，结构相应
3. **意境优美**：内容典雅，寓意吉祥，富有文化内涵

## 时间背景
- 2026年为农历丙午年，生肖属马
- 可适当融入马年元素，但不必强求，以通顺和工整为前提
- 可融入程序员相关元素，但不必强求，以通顺和工整为前提

## 创作要求

### 春联格式要求（严格遵循）：
1. **字数相等**：上下联字数必须完全相同，不多不少
2. **宜单忌双**：传统上以单数（5字、7字、9字、11字）为佳，单数为阳，象征吉祥；忌用双数
3. **常见格式**：五言联（5字）、七言联（7字，最常见）、九言联（9字）
4. **平仄格式 - 上仄下平**：
   - 上联末字必为仄声（三声、四声），即"仄起"
   - 下联末字必为平声（一声、二声），即"平收"
   - 上下联内部平仄要相对
5. **对仗格式**：
   - 词性相对：名词对名词，动词对动词，形容词对形容词，数量词对数量词
   - 结构相应：偏正结构对偏正结构，主谓结构对主谓结构，并列结构对并列结构
6. **意义相关**：上下联内容需相互衔接、呼应，共同表达主题，但避免同义重复（忌"合掌"）
7. 用词典雅，避免生僻字

### 挥春格式要求：
1. 共4个挥春
2. **每个挥春必须为四字短语**
3. 内容要吉利喜庆
4. 挥春内容要与各自主题呼应
5. 4个挥春之间要有层次感和互补性

### 输出格式：
必须以JSON格式返回，不要包含任何其他文字说明：
{
  "upperCouplet": "上联内容",
  "lowerCouplet": "下联内容",
  "horizontalScroll": "横批内容",
  "springScrolls": ["挥春1", "挥春2", "挥春3", "挥春4"]
}`;

/**
 * 构建春联生成用户提示词
 * @param topic 原始主题
 * @param wordCount 春联字数（5、7、9）
 * @param analysis 主题分析结果
 * @param previousErrors 之前的错误信息（用于改进）
 * @returns 春联生成用户提示词
 */
export function buildGenerationPrompt(
  topic: string,
  wordCount: string,
  analysis: TopicAnalysisResult,
  previousErrors?: string[]
): string {
  const horseYearSection = analysis.horseYearElements?.length
    ? `\n### 马年元素\n${analysis.horseYearElements.join('、')}`
    : '';

  const programmerSection = analysis.programmerElements?.length
    ? `\n### 程序员特色元素\n${analysis.programmerElements.join('、')}`
    : '';

  const errorSection = previousErrors?.length
    ? `\n## 注意事项（上次审查发现的问题，请务必避免）\n${previousErrors.map((err, i) => `${i + 1}. ${err}`).join('\n')}`
    : '';

  return `请为"${topic}"创作${wordCount}字春联和挥春。

## 时间背景
2026年为农历丙午年，生肖属马。可适当融入马年或程序员相关元素，但不必强求，以通顺和工整为前提。

## 创作指导（基于主题深度分析）

### 主题核心
${analysis.themeCore}

### 文化意象
${analysis.culturalImagery.join('、')}${horseYearSection}${programmerSection}

### 情感基调
${analysis.emotionalTone}

### 推荐词汇
- 名词：${analysis.keyNouns.join('、')}
- 动词：${analysis.keyVerbs.join('、')}
- 形容词：${analysis.keyAdjectives.join('、')}

### 对仗方向参考
${analysis.coupletPairs.map((pair, i) => `${i + 1}. 上联：${pair.upper} → 下联：${pair.lower}`).join('\n')}

### 横批方向
${analysis.horizontalDirection}

### 挥春主题规划（每个挥春需为四字短语）
${analysis.scrollThemes.map((scroll, i) => `${i + 1}. ${scroll.theme}（关键词：${scroll.keywords.join('、')}）`).join('\n')}${errorSection}

## 创作要求
1. **最高优先级**：通顺自然、对仗工整、意境优美
2. **字数要求**：上下联字数相等，必须为${wordCount}字，严格遵循
3. **平仄规则**：上联末字必为仄声（三声、四声），下联末字必为平声（一声、二声）
4. **对仗工整**：词性相对，结构相应，避免合掌
5. **元素融入**：可适当融入马年或程序员元素，但不必强求，以通顺和工整为前提
6. **挥春格式**：4个挥春，每个必须为四字短语

请直接返回JSON格式的结果。`;
}

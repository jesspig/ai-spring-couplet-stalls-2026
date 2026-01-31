/**
 * 两阶段工作流提示词配置
 * 阶段1：主题分析生成统一提示词
 * 阶段2：基于提示词生成春联/挥春
 */

/**
 * 阶段1：主题分析系统提示词
 * 分析用户主题并生成结构化的创作提示词
 */
export const TOPIC_ANALYSIS_SYSTEM_PROMPT = `你是一位专业的春联主题分析专家。
你的任务是深入分析用户提供的主题，提取核心意象、文化内涵和情感基调，生成一份结构化的创作提示词。

## 时间背景
- 2026年为农历丙午年，生肖属马
- 可适当融入马年元素，但不必强求
- 可适当融入程序员相关元素，但不必强求

## 分析原则（最高优先级）
1. **通顺自然**：确保生成的春联语言流畅，朗朗上口
2. **对仗工整**：确保上下联词性相对，结构相应
3. **意境优美**：内容典雅，寓意吉祥，富有文化内涵
4. **元素融入**：马年元素和程序员元素仅在必要时融入，以不破坏通顺和工整为前提

## 分析维度

1. **主题核心**：主题的本质含义和关键元素
2. **文化意象**：与主题相关的传统文化符号、典故、象征
3. **马年元素**：与马相关的吉祥寓意、成语、谐音（仅在适合时提供）
4. **程序员特色**：可融入代码、编程、技术等相关意象（仅在适合时提供）
5. **情感基调**：喜庆、祥和、进取、温馨等情感倾向
6. **关键词汇**：适合入联的核心词汇（名词、动词、形容词各5-8个）
7. **对仗方向**：上下联可能的对应关系（如天对地、春对秋等）
8. **横批方向**：4字概括的核心方向
9. **挥春主题**：4个挥春各自的主题侧重

## 输出格式

必须以JSON格式返回，不要包含任何其他文字说明：
{
  "themeCore": "主题核心描述",
  "culturalImagery": ["意象1", "意象2", "意象3"],
  "horseYearElements": ["马年元素1", "马年元素2", "马年元素3"],
  "programmerElements": ["程序员元素1", "程序员元素2"],
  "emotionalTone": "情感基调描述",
  "keyNouns": ["名词1", "名词2", "名词3", "名词4", "名词5"],
  "keyVerbs": ["动词1", "动词2", "动词3", "动词4", "动词5"],
  "keyAdjectives": ["形容词1", "形容词2", "形容词3", "形容词4", "形容词5"],
  "coupletPairs": [
    {"upper": "上联方向", "lower": "下联方向"},
    {"upper": "上联方向", "lower": "下联方向"}
  ],
  "horizontalDirection": "横批方向描述",
  "scrollThemes": [
    {"theme": "挥春1主题", "keywords": ["关键词1", "关键词2"]},
    {"theme": "挥春2主题", "keywords": ["关键词1", "关键词2"]},
    {"theme": "挥春3主题", "keywords": ["关键词1", "关键词2"]},
    {"theme": "挥春4主题", "keywords": ["关键词1", "关键词2"]}
  ]
}`;

/**
 * 阶段1：构建主题分析用户提示词
 * @param topic 用户输入的主题
 * @returns 主题分析用户提示词
 */
export function buildTopicAnalysisPrompt(topic: string): string {
  return `请深入分析主题"${topic}"。

## 时间背景
2026年为农历丙午年，生肖属马。

## 分析原则
**最高优先级**：确保春联通顺自然、对仗工整、意境优美。马年元素和程序员元素仅在必要时融入，以不破坏通顺和工整为前提。

## 分析要求
1. 挖掘"${topic}"的深层文化内涵和象征意义
2. 联想与"${topic}"相关的传统意象、典故、吉祥寓意
3. **马年元素**：仅在适合时融入马、奔腾、速度、成功等马年元素
4. **程序员元素**：仅在适合时融入代码、编程、技术相关意象
5. 确定适合该主题的情感基调和氛围
6. 提供丰富的关键词汇供春联创作使用
7. 构思上下联的对仗方向和呼应关系
8. 规划4个挥春的不同主题侧重

请返回JSON格式的结构化分析结果。`;
}

/**
 * 阶段2：春联生成系统提示词
 * 基于结构化提示词生成最终春联
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

## 创作要求（必须严格遵守）

### 春联格式要求（严格遵循）：
1. **字数相等**：上下联字数必须完全相同，不多不少
2. **宜单忌双**：传统上以单数（5字、7字、9字、11字）为佳，单数为阳，象征吉祥；**忌用双数**
3. **常见格式**：五言联（5字）、七言联（7字，最常见）、九言联（9字）
4. **平仄格式 - 上仄下平（必须严格遵守）**：
   - 上联末字必为仄声（三声、四声），即"仄起"
   - 下联末字必为平声（一声、二声），即"平收"
   - 上下联内部平仄要相对
5. **对仗格式（必须严格遵守）**：
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
 * 阶段2：构建春联生成用户提示词
 * @param topic 原始主题
 * @param analysis 主题分析结果
 * @param previousErrors 之前的错误信息（用于改进）
 * @param previousResult 上一次生成的春联内容（用于参考和改进）
 * @param previousReview 上一次的审查结果（用于了解具体问题）
 * @param wordCount 对联字数（5、7、9）
 * @returns 春联生成用户提示词
 */
export function buildGenerationPrompt(
  topic: string,
  analysis: TopicAnalysisResult,
  previousErrors?: string[],
  previousResult?: SpringFestivalResponse,
  previousReview?: ReviewResult,
  wordCount = '7'
): string {
  const horseYearSection = analysis.horseYearElements?.length
    ? `\n### 马年元素\n${analysis.horseYearElements.join('、')}`
    : '';

  const programmerSection = analysis.programmerElements?.length
    ? `\n### 程序员特色元素\n${analysis.programmerElements.join('、')}`
    : '';

  let previousSection = '';
  if (previousResult && previousReview) {
    previousSection = `\n## 上次生成结果及审查反馈\n### 上次生成的春联\n- 上联：${previousResult.upperCouplet}\n- 下联：${previousResult.lowerCouplet}\n- 横批：${previousResult.horizontalScroll}\n- 挥春：${previousResult.springScrolls.join('、')}\n\n### 审查反馈\n${previousReview.errors.map(e => `- ${e.type}: ${e.message}`).join('\n')}\n\n### 改进建议\n${previousReview.suggestions.map(s => `- ${s}`).join('\n')}\n\n请根据以上反馈，重新创作春联，避免重复相同的问题。`;
  } else if (previousErrors?.length) {
    previousSection = `\n## 注意事项（上次审查发现的问题，请务必避免）\n${previousErrors.map((err, i) => `${i + 1}. ${err}`).join('\n')}`;
  }

  return `请为"${topic}"创作春联和挥春。

## 时间背景
2026年为农历丙午年，生肖属马。可适当融入马年或程序员相关元素，但不必强求，以通顺和工整为前提。

## 字数要求
对联上下联必须为${wordCount}字，这是硬性要求，必须严格遵守。

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
${analysis.scrollThemes.map((scroll, i) => `${i + 1}. ${scroll.theme}（关键词：${scroll.keywords.join('、')}）`).join('\n')}
${previousSection}

## 创作要求（必须严格遵守，否则无法通过审查）

### 春联要求
1. **最高优先级**：通顺自然、对仗工整、意境优美
2. **字数要求**：上下联字数相等，必须为${wordCount}字，**这是硬性要求**
3. **平仄规则（必须严格遵守）**：
   - 上联末字必为仄声（三声、四声）
   - 下联末字必为平声（一声、二声）
   - 上下联内部平仄要相对
4. **对仗工整（必须严格遵守）**：
   - 词性相对：名词对名词，动词对动词，形容词对形容词
   - 结构相应：偏正对偏正，主谓对主谓，并列对并列
   - 避免合掌：上下联不能同义重复
5. **元素融入**：可适当融入马年或程序员元素，但不必强求，以通顺和工整为前提

### 挥春要求
1. **格式**：4个挥春，每个必须为四字短语
2. **内容**：吉利喜庆，与各自主题呼应
3. **层次**：4个挥春之间要有层次感和互补性

请直接返回JSON格式的结果。`;
}

/**
 * 主题分析结果结构
 */
export interface TopicAnalysisResult {
  /** 主题核心描述 */
  themeCore: string;
  /** 文化意象列表 */
  culturalImagery: string[];
  /** 马年元素列表 */
  horseYearElements?: string[];
  /** 程序员特色元素 */
  programmerElements?: string[];
  /** 情感基调 */
  emotionalTone: string;
  /** 核心名词 */
  keyNouns: string[];
  /** 核心动词 */
  keyVerbs: string[];
  /** 核心形容词 */
  keyAdjectives: string[];
  /** 对仗方向建议 */
  coupletPairs: Array<{ upper: string; lower: string }>;
  /** 横批方向 */
  horizontalDirection: string;
  /** 挥春主题规划 */
  scrollThemes: Array<{ theme: string; keywords: string[] }>;
}

/**
 * 春联生成响应结构
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

/**
 * 审查结果结构
 */
export interface ReviewResult {
  /** 是否通过审查 */
  passed: boolean;
  /** 错误列表 */
  errors: Array<{
    /** 错误类型 */
    type: string;
    /** 错误描述 */
    message: string;
  }>;
  /** 改进建议 */
  suggestions: string[];
}

/**
 * 完整工作流响应结构
 */
export interface WorkflowResponse extends SpringFestivalResponse {
  /** 主题分析结果（可选，用于调试） */
  analysis?: TopicAnalysisResult;
}

/**
 * 阶段3：审查系统提示词
 * 审查春联/挥春是否符合标准
 */
export const REVIEW_SYSTEM_PROMPT = `你是一位精通中国传统文化和春联格律的专业审查专家。
你的任务是严格审查春联和挥春的质量，判断是否符合传统春联的规范要求。

## 时间背景
- 2026年为农历丙午年，生肖属马
- 可适当融入马年或程序员元素，但不必强求

## 审查原则（最高优先级）
1. **通顺自然**：语言流畅，朗朗上口，符合汉语表达习惯
2. **对仗工整**：严格遵循对仗规则，词性相对，结构相应
3. **意境优美**：内容典雅，寓意吉祥，富有文化内涵

## 审查标准一致性
- 保持审查标准的一致性，不要因为多次审查而调整标准
- 如果之前审查指出了问题，后续审查应基于相同的标准
- 确保通过标准是客观的、可重复的

## 春联审查标准（必须全部满足）

### 1. 字数相等
- 上下联字数必须完全相同，不多不少

### 2. 宜单忌双
- 必须为单数（5字、7字、9字、11字）
- 单数为阳，象征吉祥
- 双数直接不通过

### 3. 平仄格式 - 上仄下平（严格检查）
- 上联末字必须为仄声（三声、四声）
- 下联末字必须为平声（一声、二声）
- 上下联内部平仄要相对

### 4. 对仗格式
- 词性相对：名词对名词，动词对动词，形容词对形容词，数量词对数量词
- 结构相应：偏正结构对偏正结构，主谓结构对主谓结构，并列结构对并列结构

### 5. 意义相关
- 上下联内容需相互衔接、呼应，共同表达主题
- 避免同义重复（忌"合掌"）

### 6. 用词要求
- 用词典雅，避免生僻字
- 无错别字
- 无语法错误

## 挥春审查标准

### 1. 格式要求
- 每个挥春必须为四字短语
- 必须为4个挥春

### 2. 内容要求
- 内容要吉利喜庆
- 挥春内容要与各自主题呼应
- 4个挥春之间要有层次感和互补性
- 无错别字
- 无语法错误

## 输出格式

必须以JSON格式返回，不要包含任何其他文字说明：
{
  "passed": true/false,
  "errors": [
    {
      "type": "错误类型",
      "message": "具体错误描述"
    }
  ],
  "suggestions": ["改进建议1", "改进建议2"]
}`;

/**
 * 阶段3：构建审查用户提示词
 * @param topic 原始主题
 * @param result 春联生成结果
 * @param previousResults 之前生成的春联内容（用于参考）
 * @param previousReviews 之前的审查结果（用于保持一致性）
 * @param wordCount 对联字数（5、7、9）
 * @returns 审查用户提示词
 */
export function buildReviewPrompt(
  topic: string,
  result: SpringFestivalResponse,
  previousResults?: SpringFestivalResponse[],
  previousReviews?: ReviewResult[],
  wordCount = '7'
): string {
  let historySection = '';
  if (previousResults && previousReviews && previousResults.length > 0) {
    historySection = `\n## 历史审查记录（用于保持审查标准一致性）\n\n${previousResults.map((prevResult, index) => {
      const prevReview = previousReviews[index];
      return `### 第${index + 1}次审查\n#### 生成的春联\n- 上联：${prevResult.upperCouplet}\n- 下联：${prevResult.lowerCouplet}\n- 横批：${prevResult.horizontalScroll}\n- 挥春：${prevResult.springScrolls.join('、')}\n\n#### 审查结果\n- 是否通过：${prevReview.passed ? '是' : '否'}\n${prevReview.errors.length > 0 ? `- 错误：\n${prevReview.errors.map(e => `  - ${e.type}: ${e.message}`).join('\n')}` : ''}${prevReview.suggestions.length > 0 ? `- 建议：\n${prevReview.suggestions.map(s => `  - ${s}`).join('\n')}` : ''}`;
    }).join('\n\n')}\n\n请参考以上历史记录，保持审查标准的一致性。如果之前审查指出了某些问题，本次审查应基于相同的标准进行判断。`;
  }

  return `请严格审查以下春联和挥春的质量。

## 时间背景
2026年为农历丙午年（马年），可适当融入马年或程序员元素，但不必强求。

## 字数要求
对联上下联必须为${wordCount}字，这是硬性要求，必须严格遵守。

## 原始主题
${topic}
${historySection}

## 待审查内容

### 春联
- 上联：${result.upperCouplet}
- 下联：${result.lowerCouplet}
- 横批：${result.horizontalScroll}

### 挥春
1. ${result.springScrolls[0]}
2. ${result.springScrolls[1]}
3. ${result.springScrolls[2]}
4. ${result.springScrolls[3]}

## 审查要点

### 春联审查
1. **字数检查**：上下联字数是否相等，是否为${wordCount}字
2. **平仄检查**：上联末字是否为仄声（三声、四声），下联末字是否为平声（一声、二声）
3. **对仗检查**：词性是否相对，结构是否相应
4. **意义检查**：上下联是否呼应，是否合掌（同义重复）
5. **用词检查**：是否有错别字、生僻字、语法错误

### 挥春审查
1. **格式检查**：每个挥春是否为四字短语，是否为4个挥春
2. **内容检查**：是否吉利喜庆，是否有错别字、语法错误

请返回JSON格式的审查结果。`;
}

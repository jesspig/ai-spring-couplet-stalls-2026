import type { TopicAnalysisResult } from "../../types/spring.types";

/**
 * 阶段2：春联生成提示词配置
 * 基于结构化提示词生成最终春联
 */

/**
 * 春联生成系统提示词
 * 精简为核心规则和角色定义
 */
export const SPRING_GENERATION_SYSTEM_PROMPT = `你是春联创作大师。根据提供的结构化提示词，创作符合格律的春联和挥春。

## 核心规则（优先级递减）
1. **字数严格**：上下联字数必须严格等于用户指定的字数（5/7/9字）
2. **通顺自然**：语言流畅，朗朗上口
3. **对仗工整**：词性相对，结构相应
4. **平仄合规**：上仄下平（上联末字三/四声，下联末字一/二声）
5. **意境优美**：寓意吉祥，富有文化

## 格式要求
- 上下联字数严格相等且为指定字数（5/7/9字）
- 横批4字
- 挥春4个，每个4字
- 输出合法JSON，不含markdown标记

## 重要提醒
⚠️ 字数是最高优先级要求，必须严格满足，任何字数错误都是不可接受的`;

/**
 * 春联生成Few-shot示例
 * 展示优质春联的平仄和对仗格式
 */
const GENERATION_EXAMPLES = `
## 优质春联示例

### 示例1：5字春联（新春主题）
{
  "upperCouplet": "爆竹传笑语",
  "lowerCouplet": "腊梅吐幽香",
  "horizontalScroll": "春满人间",
  "springScrolls": ["迎春接福", "万象更新", "春回大地", "福满人间"]
}
**平仄分析**：
- 上联：仄仄平仄仄（末字"语"为三声，仄声 ✓）
- 下联：仄平仄平平（末字"香"为一声，平声 ✓）

### 示例2：7字春联（事业主题）
{
  "upperCouplet": "宏图大展千秋业",
  "lowerCouplet": "伟业初兴万里春",
  "horizontalScroll": "前程似锦",
  "springScrolls": ["事业有成", "步步高升", "财源广进", "马到成功"]
}
**平仄分析**：
- 上联：平平仄仄平平仄（末字"业"为四声，仄声 ✓）
- 下联：仄仄平平仄仄平（末字"春"为一声，平声 ✓）

### 示例3：7字春联（家庭主题）
{
  "upperCouplet": "和顺一门生百福",
  "lowerCouplet": "平安二字值千金",
  "horizontalScroll": "万事如意",
  "springScrolls": ["阖家欢乐", "身体健康", "幸福美满", "吉祥如意"]
}
**平仄分析**：
- 上联：仄平平平平仄仄（末字"福"为二声，但此处作入声处理为仄声 ✓）
- 下联：平平仄仄仄平平（末字"金"为一声，平声 ✓）

### 示例4：9字春联（马年主题）
{
  "upperCouplet": "马跃前程驰骋大道",
  "lowerCouplet": "春回大地大展宏图",
  "horizontalScroll": "马到成功",
  "springScrolls": ["一马当先", "快马加鞭", "龙马精神", "马上发财"]
}
**平仄分析**：
- 上联：仄仄平平平仄仄仄（末字"道"为四声，仄声 ✓）
- 下联：平平仄仄仄仄平平（末字"图"为二声，平声 ✓）

### 示例5：9字春联（新春主题）
{
  "upperCouplet": "春回大地千山秀美色",
  "lowerCouplet": "福满人间万象新风光",
  "horizontalScroll": "春满人间",
  "springScrolls": ["迎春接福", "万象更新", "春回大地", "福满人间"]
}
**平仄分析**：
- 上联：平平仄仄平平仄仄仄（末字"色"为四声，仄声 ✓）
- 下联：仄平平平仄仄平平平（末字"光"为一声，平声 ✓）

### 示例6：9字春联（事业主题）
{
  "upperCouplet": "一帆风顺年年皆如意",
  "lowerCouplet": "万事如意步步总吉祥",
  "horizontalScroll": "前程似锦",
  "springScrolls": ["事业有成", "步步高升", "财源广进", "吉祥如意"]
}
**平仄分析**：
- 上联：仄平平仄平平平平仄（末字"意"为四声，仄声 ✓）
- 下联：平仄仄仄仄仄仄平平（末字"祥"为二声，平声 ✓）

### 示例7：9字春联（科技主题）
{
  "upperCouplet": "代码如诗写出锦绣景",
  "lowerCouplet": "算法似画绘就宏图篇",
  "horizontalScroll": "码年大吉",
  "springScrolls": ["代码无Bug", "上线顺利", "需求明确", "项目成功"]
}
**平仄分析**：
- 上联：仄仄平平仄仄仄仄仄（末字"景"为三声，仄声 ✓）
- 下联：仄仄仄仄仄仄平平平（末字"篇"为一声，平声 ✓）

### 示例8：9字春联（家庭主题）
{
  "upperCouplet": "家和事兴年年皆顺遂",
  "lowerCouplet": "人旺财旺代代总兴隆",
  "horizontalScroll": "阖家欢乐",
  "springScrolls": ["身体健康", "平安喜乐", "幸福美满", "吉祥如意"]
}
**平仄分析**：
- 上联：平平仄平平平平仄仄（末字"遂"为四声，仄声 ✓）
- 下联：平仄平仄仄仄仄平平（末字"隆"为二声，平声 ✓）`;

/**
 * 平仄判定辅助说明
 */
const PINGZE_GUIDE = `
## 平仄快速判定

### 平声（一声、二声）
常用平声字：天、地、春、风、花、开、来、年、人、家、福、祥、龙、鹏、程、图、金、银、新、欢、康、安、宁、明、清、云、山、江、河、湖、海

### 仄声（三声、四声）
常用仄声字：水、火、土、木、日、月、星、雨、雪、霜、露、雾、电、雷、业、策、路、道、梦、境、意、气、力、速、度、代、码、序、统、架、构、站、店、院、社、会、界、纪、念、祝、贺、庆、贺、喜、悦、乐、快、意、志、愿、望、景、致、趣、味、义、意、理、念、想、法、术、技、巧、艺、业、绩、效、果、报、告、示、范、例、证、明、确、定、义、务、实、践、行、动、作、为、事、物、体、系、统、制、度、规、则、律、法、令、命、令、号、召、集、合、组、织、结、构、架、设、建、筑、造、制、作、创、造、生、产、出、品、产、物、货、币、钱、财、富、贵、贱、买、卖、交、易、贸、易、商、品、产、业、企、业、事、业、职、业、专、业、行、业、工、作、劳、动、活、动、运、动、行、动、举、动、措、施、策、略、计、划、方、案、办、法、方、式、形、式、模、式、格、式、规、格、标、准、准、则、原、则、原、理、定、理、公、理、定、律、规、律、法、则

### 特殊说明
- "福"字：现代读二声（平），但古音为入声（仄），春联中通常按仄声处理
- "一"字：单用或词尾读一声（平），在词中读四声（仄）
- "不"字：单用读四声（仄），在去声字前读二声（平）`;

/**
 * 历史记录类型定义
 */
export interface GenerationHistory {
  attempt: number;
  upperCouplet: string;
  lowerCouplet: string;
  horizontalScroll: string;
  springScrolls: string[];
  reviewResult: {
    passed: boolean;
    errors: Array<{ type: string; message: string }>;
    suggestions: string[];
  };
  errorCategories: string[];
}

/**
 * 构建春联生成用户提示词
 * @param topic 原始主题
 * @param wordCount 春联字数（5、7、9）
 * @param analysis 主题分析结果
 * @param history 历史生成和审查记录（用于上下文累积和改进）
 * @returns 春联生成用户提示词
 */
export function buildGenerationPrompt(
  topic: string,
  wordCount: string,
  analysis: TopicAnalysisResult,
  history?: GenerationHistory[]
): string {
  const horseYearSection = analysis.horseYearElements?.length
    ? `\n### 马年元素（可选融入）\n${analysis.horseYearElements.join('、')}`
    : '';

  const programmerSection = analysis.programmerElements?.length
    ? `\n### 程序员元素（可选融入）\n${analysis.programmerElements.join('、')}`
    : '';

  let historySection = '';
  if (history && history.length > 0) {
    const errorPatternAnalysis = analyzeErrorPatterns(history);
    const successPatternAnalysis = analyzeSuccessPatterns(history);
    
    historySection = `
## 📋 历史生成与审查记录（共${history.length}次尝试）

### 历史错误模式分析
${errorPatternAnalysis}

### 成功案例参考（如有）
${successPatternAnalysis}

### 历史生成记录
${history.map(h => `
**第${h.attempt}次尝试** ${h.reviewResult.passed ? '✓ 通过' : '✗ 未通过'}
- 上联：${h.upperCouplet}
- 下联：${h.lowerCouplet}
- 横批：${h.horizontalScroll}
- 挥春：${h.springScrolls.join('、')}
- 审查结果：${h.reviewResult.passed ? '通过' : `未通过 - ${h.reviewResult.errors.map(e => e.message).join('；')}`}
- 错误分类：${h.errorCategories.join('、') || '无'}
- 改进建议：${h.reviewResult.suggestions.join('；') || '无'}
`).join('\n')}

### 改进指导
${generateImprovementGuidance(history, errorPatternAnalysis)}
`;
  }

  return `为主题"${topic}"创作${wordCount}字春联和挥春。

${GENERATION_EXAMPLES}

${PINGZE_GUIDE}

${historySection}

## 创作指导

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

### 挥春主题规划
${analysis.scrollThemes.map((scroll, i) => `${i + 1}. ${scroll.theme}（关键词：${scroll.keywords.join('、')}）`).join('\n')}

## 创作要求
⚠️ **最高优先级：字数必须严格满足**

1. **字数严格${wordCount}字**：上下联字数必须严格等于${wordCount}字，多一字少一字都是错误
2. **字数验证**：生成后必须逐字检查上下联字数，确保严格为${wordCount}字
3. **平仄必须合规**：上联末字仄声（三/四声），下联末字平声（一/二声）
4. **对仗工整**：词性相对，结构相应，避免合掌
5. **通顺自然**：朗朗上口，符合汉语表达习惯
6. **挥春格式**：4个挥春，每个必须为四字吉利短语

## 输出格式
{\n  "upperCouplet": "上联内容（严格${wordCount}字，末字仄声）",\n  "lowerCouplet": "下联内容（严格${wordCount}字，末字平声）",\n  "horizontalScroll": "横批（4字）",\n  "springScrolls": ["挥春1", "挥春2", "挥春3", "挥春4"]\n}

## 最终检查清单
在输出前请务必检查：
- [ ] 上联字数是否严格为${wordCount}字
- [ ] 下联字数是否严格为${wordCount}字
- [ ] 上联末字是否为仄声（三/四声）
- [ ] 下联末字是否为平声（一/二声）
- [ ] 横批是否为4字
- [ ] 挥春是否为4个，每个4字`;
}

/**
 * 分析历史错误模式
 * @param history 历史记录
 * @returns 错误模式分析文本
 */
function analyzeErrorPatterns(history: GenerationHistory[]): string {
  const errorTypeCount = new Map<string, number>();
  const errorMessages: string[] = [];
  
  history.forEach(h => {
    h.reviewResult.errors.forEach(e => {
      errorTypeCount.set(e.type, (errorTypeCount.get(e.type) || 0) + 1);
      errorMessages.push(e.message);
    });
  });
  
  if (errorTypeCount.size === 0) {
    return '暂无错误记录';
  }
  
  const sortedErrors = Array.from(errorTypeCount.entries())
    .sort((a, b) => b[1] - a[1]);
  
  const mainErrors = sortedErrors.slice(0, 3).map(([type, count]) => 
    `- ${type}：出现${count}次`
  ).join('\n');
  
  return `**高频错误类型**（按出现次数排序）\n${mainErrors}\n\n**错误详情**\n${errorMessages.slice(0, 5).map((msg, i) => `${i + 1}. ${msg}`).join('\n')}`;
}

/**
 * 分析成功案例模式
 * @param history 历史记录
 * @returns 成功案例分析文本
 */
function analyzeSuccessPatterns(history: GenerationHistory[]): string {
  const successCases = history.filter(h => h.reviewResult.passed);
  
  if (successCases.length === 0) {
    return '暂无成功案例';
  }
  
  const latestSuccess = successCases[successCases.length - 1];
  
  return `**最新成功案例（第${latestSuccess.attempt}次）**\n- 上联：${latestSuccess.upperCouplet}\n- 下联：${latestSuccess.lowerCouplet}\n- 横批：${latestSuccess.horizontalScroll}\n- 挥春：${latestSuccess.springScrolls.join('、')}\n\n**成功要点**：参考此案例的平仄、对仗和用词模式`;
}

/**
 * 生成改进指导
 * @param history 历史记录
 * @param errorPatternAnalysis 错误模式分析
 * @returns 改进指导文本
 */
function generateImprovementGuidance(history: GenerationHistory[], errorPatternAnalysis: string): string {
  const latestAttempt = history[history.length - 1];
  const attemptCount = history.length;
  
  let guidance = [];
  
  if (attemptCount >= 2) {
    guidance.push(`⚠️ 这是第${attemptCount}次尝试，前${attemptCount - 1}次均未通过审查`);
  }
  
  const errorTypes = new Set<string>();
  history.forEach(h => {
    h.reviewResult.errors.forEach(e => errorTypes.add(e.type));
  });
  
  if (errorTypes.has('字数错误') || errorTypes.has('格式错误')) {
    guidance.push('🚨 **最高优先级：字数严格满足**\n- 上下联字数必须严格等于指定字数（5/7/9字）\n- 多一字少一字都是错误，必须逐字检查\n- 生成前先确定字数，再填充内容\n- 输出前必须再次验证字数是否正确');
  }
  
  if (errorTypes.has('平仄错误')) {
    guidance.push('🎯 **优先级2：平仄合规**\n- 上联末字必须是三声或四声（仄声）\n- 下联末字必须是一声或二声（平声）\n- 逐字检查声调，不确定时参考平速判定指南');
  }
  
  if (errorTypes.has('对仗错误')) {
    guidance.push('🎯 **优先级3：对仗工整**\n- 词性相对：名词对名词、动词对动词\n- 结构相应：偏正对偏正、主谓对主谓\n- 避免合掌：上下联意思不要过于相近');
  }
  
  if (errorTypes.has('内容错误')) {
    guidance.push('🎯 **优先级4：内容质量**\n- 无错别字、无语法错误\n- 用词典雅、无生僻字\n- 挥春内容吉利喜庆');
  }
  
  if (guidance.length === 0) {
    guidance.push('✓ 历史记录显示主要问题已解决，请继续保持高质量标准');
  }
  
  return guidance.join('\n\n');
}

import type { SpringFestivalResponse } from "../../types/spring.types";

/**
 * 阶段3：审查提示词配置
 * 审查春联/挥春是否符合标准
 */

/**
 * 审查系统提示词
 * 精简为核心规则，详细标准移至userPrompt
 */
export const REVIEW_SYSTEM_PROMPT = `你是春联质量审查专家。审查春联和挥春是否符合基本规范。

## 审查原则（娱乐导向，适度宽松）
1. **格式正确**：JSON结构完整，字段齐全
2. **字数合规**：上下联字数相等且为指定字数
3. **平仄基本**：上联末字仄声（三/四声），下联末字平声（一/二声）
4. **对仗基本**：词性大致相对，结构大致相应
5. **内容可读**：寓意吉祥，无错别字，语言通顺

## 重要说明
⚠️ **娱乐项目定位**：本项目为娱乐性质，审查标准应适度宽松，注重用户体验而非学术严谨。

## 输出要求
- 返回JSON格式
- 包含passed布尔值、errors数组、suggestions数组
- 未通过时提供具体错误信息和改进建议
- 只要满足基本要求即可通过，不追求完美`;

/**
 * 平仄判定详细指南
 */
const PINGZE_DETAILED_GUIDE = `
## 平仄判定标准（严格按现代汉语拼音）

### 平声（一声、二声）- 下联末字必须是平声
常用平声字示例：
- 一声：天、春、风、花、开、家、福、祥、龙、鹏、程、图、金、新、欢、康、安、宁、明、清、云、山、江、河、东、西、南、北、中、心、身、神、真、深、音、因、今、心、恩、温、尊、村、孙、尊、军、君、均、钧、君、军、君、均
- 二声：云、龙、鹏、程、图、银、年、人、民、文、闻、祥、长、扬、阳、洋、羊、王、皇、黄、梁、强、祥、详、翔、洋、扬、杨、阳、王、皇、黄、唐、堂、塘、糖、忙、芒、茫、盲、郎、狼、廊、朗、浪、郎、朗、康、唐、堂、忙、茫、郎、狼、郎、康、强、祥、详、翔、洋、扬、杨、阳、王、皇、黄、文、闻、云、龙、鹏、程、图、银、年、人、民

### 仄声（三声、四声）- 上联末字必须是仄声
常用仄声字示例：
- 三声：水、火、土、雨、雪、海、鸟、马、草、手、走、友、有、酒、久、九、柳、流（古音，现代二声）、海、鸟、马、草、手、走、友、有、酒、久、九、柳、海、鸟、马、草、手、走、友、有、酒、久、九、柳、海、鸟、马、草、手、走、友、有、酒、久、九、柳
- 四声：日、月、木、石、玉、路、树、去、住、处、事、世、市、式、势、是、士、示、视、试、识、适、释、饰、誓、逝、氏、市、式、势、是、士、示、视、试、识、适、释、饰、誓、逝、氏、路、树、去、住、处、事、世、市、式、势、是、士、示、视、试、识、适、释、饰、誓、逝、氏、日、月、木、石、玉

### 特殊字处理
- **福**：现代读二声（平），但春联传统中按仄声处理（古入声）
- **一**：单用或词尾读一声（平），在词中读四声（仄）
- **不**：单用读四声（仄），在去声字前读二声（平）
- **竹、菊、曲、出、息、德、竹、菊、曲、出、息、德**：古入声字，按仄声处理

### 判定方法
1. 看拼音声调标记：一声ˉ、二声ˊ为平声；三声ˇ、四声ˋ为仄声
2. 不确定时参考常用字表
3. 多音字根据语境判断最常用读音`;

/**
 * 对仗判定标准
 */
const DUIZHANG_GUIDE = `
## 对仗判定标准

### 词性对应
- 名词对名词：天对地、雨对风、大陆对长空
- 动词对动词：开对落、起对收、欢歌对笑语
- 形容词对形容词：高对低、长对短、春风对秋月
- 数量词对数量词：一对两、三对五、千秋对万代

### 结构对应
- 偏正结构对偏正结构：春风对秋月、瑞雪对丰年
- 主谓结构对主谓结构：花开对叶落、鸟语对花香
- 并列结构对并列结构：山川对湖海、风雨对雷电

### 常见错误
- **合掌**：上下联意思重复（如"辞旧岁"对"迎新年"是正确对仗，但"传喜讯"对"报佳音"过于相近）
- **词性不对应**：名词对动词、形容词对数量词
- **结构不对应**：偏正结构对主谓结构`;

/**
 * 审查示例
 */
const REVIEW_EXAMPLES = `
## 审查示例

### 示例1：通过的春联
输入：
- 上联：宏图大展千秋业（平平仄仄平平仄）
- 下联：伟业初兴万里春（仄仄平平仄仄平）

审查结果：
{
  "passed": true,
  "errors": [],
  "suggestions": ["平仄合规，对仗工整，意境优美"]
}

### 示例2：平仄正确的春联（传统标准）
输入：
- 上联：春回大地百花艳（平平仄仄仄平仄）
- 下联：福满人间万象新（仄平平平仄仄平）

审查结果：
{
  "passed": true,
  "errors": [],
  "suggestions": ["平仄合规：上联末字'艳'为四声（仄声），下联末字'新'为一声（平声），符合传统标准"]
}

### 示例3：对仗基本工整的春联（娱乐标准，适度宽松）
输入：
- 上联：一帆风顺年年好（仄平平仄平平仄）
- 下联：万事如意步步高（平仄仄仄仄仄平）

审查结果：
{
  "passed": true,
  "errors": [],
  "suggestions": ["对仗基本工整：'一帆风顺'与'万事如意'结构大致对应，'年年'与'步步'叠词对应良好，符合娱乐项目宽松标准"]
}`;

/**
 * 审查历史记录类型定义
 */
export interface ReviewHistory {
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
 * 构建审查用户提示词
 * @param topic 原始主题
 * @param wordCount 春联字数
 * @param result 春联生成结果
 * @param history 历史生成和审查记录（用于标准一致性检查）
 * @returns 审查用户提示词
 */
export function buildReviewPrompt(
  topic: string,
  wordCount: string,
  result: SpringFestivalResponse,
  history?: ReviewHistory[]
): string {
    let historyContext = '';
    if (history && history.length > 0) {
      const consistencyCheck = generateConsistencyCheck(history);
      const reviewHistory = generateReviewHistory(history);
      
      historyContext = `
## 📋 历史审查记录（共${history.length}次审查）

### 审查标准一致性检查
${consistencyCheck}

### 历史审查详情
${reviewHistory}

### 审查决策记录
本次审查请记录决策依据，确保与历史审查标准保持一致。
`;
    }

    return `审查以下${wordCount}字春联和挥春的质量。

${PINGZE_DETAILED_GUIDE}

${DUIZHANG_GUIDE}

${REVIEW_EXAMPLES}

${historyContext}

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

## 审查清单

### 1. 字数检查（已由程序验证，通常无需关注）
- [ ] 上下联字数相等（程序已验证）
- [ ] 上下联均为${wordCount}字（程序已验证）
- [ ] 横批为4字
- [ ] 挥春共4个，每个4字

**注**：字数已由程序层面严格验证，如出现字数错误会直接触发重试，不会进入审查阶段。

### 2. 平仄检查（基本要求）
- [ ] 上联末字为仄声（三声或四声）
- [ ] 下联末字为平声（一声或二声）

**重要**：末字平仄符合即可通过，中间字平仄不做严格要求。

### 3. 对仗检查（基本要求）
- [ ] 词性大致相对（名词对名词、动词对动词等）
- [ ] 结构大致相应（偏正对偏正、主谓对主谓等）
- [ ] 避免明显合掌（上下联意思不要过于相近）

**重要**：对仗要求适度宽松，只要大致相对即可，不追求完美对仗。

### 4. 内容检查
- [ ] 无错别字
- [ ] 无语法错误
- [ ] 用词典雅，无生僻字
- [ ] 挥春内容吉利喜庆

## 输出格式
{
  "passed": true/false,
  "errors": [
    {
      "type": "错误类型（字数错误/平仄错误/对仗错误/内容错误）",
      "message": "具体错误描述，包括位置和建议"
    }
  ],
  "suggestions": ["改进建议1", "改进建议2"]
}

**重要**：
- 平仄判定严格按现代汉语拼音声调
- 错误描述要具体，指出具体位置和原因
- 改进建议要可操作，便于下次生成时避免`;
}

/**
 * 生成审查标准一致性检查
 * @param history 历史审查记录
 * @returns 一致性检查文本
 */
function generateConsistencyCheck(history: ReviewHistory[]): string {
  const errorTypeFrequency = new Map<string, number>();
  const passedCount = history.filter(h => h.reviewResult.passed).length;
  
  history.forEach(h => {
    h.reviewResult.errors.forEach(e => {
      errorTypeFrequency.set(e.type, (errorTypeFrequency.get(e.type) || 0) + 1);
    });
  });
  
  let check = `**审查统计**\n- 总审查次数：${history.length}\n- 通过次数：${passedCount}\n- 未通过次数：${history.length - passedCount}\n\n`;
  
  if (errorTypeFrequency.size > 0) {
    const sortedErrors = Array.from(errorTypeFrequency.entries())
      .sort((a, b) => b[1] - a[1]);
    
    check += `**历史错误类型频率**\n`;
    sortedErrors.forEach(([type, count]) => {
      check += `- ${type}：${count}次\n`;
    });
    
    check += `\n**一致性要求**\n`;
    check += `1. 保持与历史审查相同的错误判定标准\n`;
    check += `2. 避免对相同问题重复标记（除非问题确实存在）\n`;
    check += `3. 如果历史中某类错误频繁出现，本次审查应重点关注此类问题\n`;
    check += `4. 对于历史中已通过审查的案例，参考其质量标准\n`;
  } else {
    check += `**一致性要求**\n`;
    check += `1. 这是首次审查，请建立严格的审查标准\n`;
    check += `2. 本次审查的标准将作为后续审查的参考基准\n`;
  }
  
  return check;
}

/**
 * 生成历史审查详情
 * @param history 历史审查记录
 * @returns 历史审查详情文本
 */
function generateReviewHistory(history: ReviewHistory[]): string {
  return history.map(h => `
**第${h.attempt}次审查** ${h.reviewResult.passed ? '✓ 通过' : '✗ 未通过'}
- 上联：${h.upperCouplet}
- 下联：${h.lowerCouplet}
- 横批：${h.horizontalScroll}
- 审查结果：${h.reviewResult.passed ? '通过' : `未通过 - ${h.reviewResult.errors.map(e => e.message).join('；')}`}
- 错误分类：${h.errorCategories.join('、') || '无'}
- 改进建议：${h.reviewResult.suggestions.join('；') || '无'}
`).join('\n');
}

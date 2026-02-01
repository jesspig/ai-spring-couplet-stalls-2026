/**
 * 阶段1：主题分析提示词配置
 * 分析用户主题并生成结构化的创作提示词
 */

/**
 * 主题分析系统提示词
 * 聚焦角色定义和核心规则，消除与userPrompt的重复
 */
export const TOPIC_ANALYSIS_SYSTEM_PROMPT = `你是春联主题分析专家。深入分析用户主题，输出JSON格式的结构化创作指导。

## 核心职责
1. 提取主题的文化内涵和象征意义
2. 识别适合入联的词汇和对仗关系
3. 规划4个挥春的不同主题侧重

## 约束条件
- 2026年为丙午马年
- 马年元素和程序员元素仅在自然融入时提供
- 输出必须为合法JSON，不要包含markdown代码块标记`;

/**
 * 主题分析Few-shot示例
 * 帮助模型理解输出质量标杆
 */
const ANALYSIS_EXAMPLES = `
## 输出示例

### 示例1：主题"事业"
{
  "themeCore": "事业发展、职场进取、成功腾飞的核心主题",
  "culturalImagery": ["鹏程万里", "步步高升", "大展宏图", "蒸蒸日上", "事业有成"],
  "horseYearElements": ["马到成功", "一马当先", "快马加鞭"],
  "programmerElements": ["代码如诗", "架构稳健", "迭代升级"],
  "emotionalTone": "积极向上、进取开拓、充满希望",
  "keyNouns": ["事业", "前程", "宏图", "鹏程", "云程"],
  "keyVerbs": ["展", "创", "登", "跃", "驰"],
  "keyAdjectives": ["辉煌", "锦绣", "远大", "蓬勃", "腾飞"],
  "coupletPairs": [
    {"upper": "展宏图伟业", "lower": "创锦绣前程"},
    {"upper": "鹏程万里起", "lower": "事业九天飞"}
  ],
  "horizontalDirection": "事业有成、前程似锦",
  "scrollThemes": [
    {"theme": "事业腾飞", "keywords": ["腾飞", "发展", "进步"]},
    {"theme": "财源广进", "keywords": ["财富", "收入", "盈利"]},
    {"theme": "步步高升", "keywords": ["晋升", "提升", "上升"]},
    {"theme": "前程似锦", "keywords": ["未来", "前景", "美好"]}
  ]
}

### 示例2：主题"家庭"
{
  "themeCore": "家庭和睦、幸福美满、团圆温馨的核心主题",
  "culturalImagery": ["天伦之乐", "家和万事兴", "阖家欢乐", "幸福美满", "团团圆圆"],
  "horseYearElements": [],
  "programmerElements": [],
  "emotionalTone": "温馨祥和、幸福美满、其乐融融",
  "keyNouns": ["家庭", "家园", "天伦", "门庭", "家园"],
  "keyVerbs": ["享", "聚", "迎", "纳", "承"],
  "keyAdjectives": ["和睦", "美满", "温馨", "幸福", "吉祥"],
  "coupletPairs": [
    {"upper": "家和万事兴", "lower": "人善百年康"},
    {"upper": "门迎百福至", "lower": "户纳千祥来"}
  ],
  "horizontalDirection": "阖家欢乐、家和万事兴",
  "scrollThemes": [
    {"theme": "家庭和睦", "keywords": ["和睦", "和谐", "温馨"]},
    {"theme": "身体健康", "keywords": ["健康", "平安", "长寿"]},
    {"theme": "幸福美满", "keywords": ["幸福", "美满", "快乐"]},
    {"theme": "万事如意", "keywords": ["顺利", "如意", "顺心"]}
  ]
}`;

/**
 * 构建主题分析用户提示词
 * @param topic 用户输入的主题
 * @param wordCount 春联字数（5、7、9）
 * @returns 主题分析用户提示词
 */
export function buildTopicAnalysisPrompt(topic: string, wordCount: string = '7'): string {
  return `分析主题"${topic}"，为${wordCount}字春联创作提供结构化指导。

## 分析维度
1. **themeCore**: 主题本质含义（20字以内）
2. **culturalImagery**: 相关传统文化符号、典故（5-8个）
3. **horseYearElements**: 马年相关吉祥寓意（可选，仅自然融入时提供）
4. **programmerElements**: 程序员相关意象（可选，仅自然融入时提供）
5. **emotionalTone**: 情感基调描述（15字以内）
6. **keyNouns/keyVerbs/keyAdjectives**: 各5-8个适合入联的词汇
7. **coupletPairs**: 2-3组上下联对仗方向示例
8. **horizontalDirection**: 横批创作方向（10字以内）
9. **scrollThemes**: 4个挥春主题，每个包含主题名和2-3个关键词

${ANALYSIS_EXAMPLES}

## 输出要求
- 严格返回JSON格式，不要markdown代码块
- 数组元素要丰富具体，避免空泛词汇
- 对仗方向要体现词性和结构的对应关系
- 挥春主题要有层次感和互补性`;
}

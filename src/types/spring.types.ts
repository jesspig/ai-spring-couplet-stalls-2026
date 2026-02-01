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
 * 完整工作流响应结构
 */
export interface WorkflowResponse extends SpringFestivalResponse {
  /** 主题分析结果（可选，用于调试） */
  analysis?: TopicAnalysisResult;
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

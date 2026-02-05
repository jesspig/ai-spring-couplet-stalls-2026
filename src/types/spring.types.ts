/**
 * 主题分析结果（精简版）
 */
export type TopicAnalysisResult = string;

/**
 * 上联生成结果
 */
export interface UpperCoupletResult {
  /** 上联 */
  upperCouplet: string;
}

/**
 * 下联生成结果
 */
export interface LowerCoupletResult {
  /** 下联 */
  lowerCouplet: string;
}

/**
 * 格式审查结果（宽松标准）
 */
export interface FormatReviewResult {
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
 * 挥春生成结果
 */
export interface SpringScrollsResult {
  /** 六个挥春 */
  springScrolls: string[];
}

/**
 * 春联基础数据结构
 */
export interface SpringFestivalData {
  /** 上联 */
  upperCouplet: string;
  /** 下联 */
  lowerCouplet: string;
  /** 横批 */
  horizontalScroll: string;
  /** 六个挥春 */
  springScrolls: string[];
}

/**
 * 生成历史记录
 */
export interface GenerationHistory {
  attempt: number;
  upperCouplet: string;
  lowerCouplet: string;
}

/**
 * 表单信息结构（用于回退时恢复表单）
 */
export interface FormData {
  /** 用户输入的主题 */
  topic: string;
  /** 字数选择 */
  wordCount: string;
  /** 对联顺序 */
  coupletOrder: 'upper-lower' | 'lower-upper';
  /** 横批方向 */
  horizontalDirection: 'left-right' | 'right-left';
  /** 福字方向 */
  fuDirection: 'upright' | 'rotated';
}

/**
 * 工作流步骤状态
 */
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * 工作流步骤定义
 */
export interface WorkflowStep {
  /** 步骤唯一标识 */
  id: string;
  /** 步骤名称 */
  name: string;
  /** 步骤描述 */
  description: string;
  /** 当前状态 */
  status: StepStatus;
  /** 模型输出内容（进行中或已完成时） */
  output?: string;
  /** 开始时间 */
  startTime?: number;
  /** 完成时间 */
  endTime?: number;
  /** 错误信息 */
  error?: string;
}

/**
 * 进度事件类型
 */
export type ProgressEventType =
  | 'analysis_start'
  | 'analysis_complete'
  | 'upper_couplet_start'
  | 'upper_couplet_complete'
  | 'upper_couplet_failed'
  | 'lower_couplet_start'
  | 'lower_couplet_complete'
  | 'lower_couplet_failed'
  | 'spring_scrolls_start'
  | 'spring_scrolls_complete'
  | 'spring_scrolls_failed'
  | 'horizontal_scroll_start'
  | 'horizontal_scroll_complete'
  | 'workflow_complete'
  | 'workflow_failed'
  | 'workflow_aborted';

/**
 * 进度事件
 */
export interface ProgressEvent {
  /** 事件类型 */
  type: ProgressEventType;
  /** 事件时间戳 */
  timestamp: number;
  /** 步骤名称 */
  stepName: string;
  /** 步骤描述 */
  stepDescription: string;
  /** 输出内容 */
  output?: string;
  /** 错误信息 */
  error?: string;
  /** 是否是重试步骤 */
  isRetry?: boolean;
  /** 重试次数 */
  retryCount?: number;
}

/**
 * 进度回调函数类型
 */
export type ProgressCallback = (event: ProgressEvent) => void;

/**
 * 工作流响应结构
 * 继承自 SpringFestivalData，添加工作流相关字段
 */
export interface WorkflowResponse extends SpringFestivalData {
  /** 主题分析结果（可选，用于调试） */
  analysis?: TopicAnalysisResult;
  /** 是否需要回退到首页 */
  shouldReturnToHome?: boolean;
  /** 回退时的表单信息 */
  formData?: FormData;
  /** 回退时的错误信息 */
  errorMessage?: string;
  /** 是否被中止 */
  aborted?: boolean;
}

/**
 * 生成记录状态
 */
export type GenerationStatus = 'pending' | 'completed' | 'failed' | 'aborted';

/**
 * 生成记录
 */
export interface GenerationRecord {
  /** 唯一标识符 (UUID) */
  id: string;
  /** 创建时间戳 */
  createdAt: number;
  /** 主题 */
  topic: string;
  /** 字数 */
  wordCount: string;
  /** 表单配置 */
  formData: FormData;
  /** 生成状态 */
  status: GenerationStatus;
  /** 生成步骤 */
  steps: WorkflowStep[];
  /** 生成结果（成功时） */
  result?: WorkflowResponse;
  /** 错误信息（失败时） */
  error?: string;
}

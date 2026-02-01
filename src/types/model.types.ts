/**
 * 模型信息
 */
export interface Model {
  /** 模型ID */
  id: string;
  /** 对象类型 */
  object: string;
  /** 创建时间戳 */
  created: number;
  /** 所属组织 */
  owned_by: string;
}

/**
 * 模型列表响应
 */
export interface ModelsResponse {
  /** 对象类型 */
  object: string;
  /** 模型列表 */
  data: Model[];
}

import type { FormData } from '../types/spring.types';

/**
 * 对联顺序类型（UI 显示）
 */
export type CoupletOrderDisplay = 'leftUpper' | 'rightUpper';

/**
 * 对联顺序类型（表单数据）
 */
export type CoupletOrderForm = 'upper-lower' | 'lower-upper';

/**
 * 横批方向类型（UI 显示）
 */
export type HorizontalDirectionDisplay = 'leftToRight' | 'rightToLeft';

/**
 * 横批方向类型（表单数据）
 */
export type HorizontalDirectionForm = 'left-right' | 'right-left';

/**
 * 福字方向类型（UI 显示）
 */
export type FuOrientationDisplay = 'upright' | 'inverted';

/**
 * 福字方向类型（表单数据）
 */
export type FuOrientationForm = 'upright' | 'rotated';

/**
 * UI 显示配置接口
 */
export interface LayoutConfigDisplay {
  wordCount: string;
  coupletOrder: CoupletOrderDisplay;
  horizontalDirection: HorizontalDirectionDisplay;
  fuOrientation: FuOrientationDisplay;
}

/**
 * 表单配置接口
 */
export interface LayoutConfigForm {
  coupletOrder: CoupletOrderForm;
  horizontalDirection: HorizontalDirectionForm;
  fuDirection: FuOrientationForm;
}

/**
 * 对联顺序映射表
 */
const COUPLET_ORDER_MAP: Record<CoupletOrderDisplay, CoupletOrderForm> = {
  leftUpper: 'upper-lower',
  rightUpper: 'lower-upper'
};

const COUPLET_ORDER_REVERSE_MAP: Record<CoupletOrderForm, CoupletOrderDisplay> = {
  'upper-lower': 'leftUpper',
  'lower-upper': 'rightUpper'
};

/**
 * 横批方向映射表
 */
const HORIZONTAL_DIRECTION_MAP: Record<HorizontalDirectionDisplay, HorizontalDirectionForm> = {
  leftToRight: 'left-right',
  rightToLeft: 'right-left'
};

const HORIZONTAL_DIRECTION_REVERSE_MAP: Record<HorizontalDirectionForm, HorizontalDirectionDisplay> = {
  'left-right': 'leftToRight',
  'right-left': 'rightToLeft'
};

/**
 * 福字方向映射表
 */
const FU_ORIENTATION_MAP: Record<FuOrientationDisplay, FuOrientationForm> = {
  upright: 'upright',
  inverted: 'rotated'
};

const FU_ORIENTATION_REVERSE_MAP: Record<FuOrientationForm, FuOrientationDisplay> = {
  upright: 'upright',
  rotated: 'inverted'
};

/**
 * 将 UI 显示配置转换为表单配置
 */
export function displayConfigToFormConfig(display: LayoutConfigDisplay): LayoutConfigForm {
  return {
    coupletOrder: COUPLET_ORDER_MAP[display.coupletOrder],
    horizontalDirection: HORIZONTAL_DIRECTION_MAP[display.horizontalDirection],
    fuDirection: FU_ORIENTATION_MAP[display.fuOrientation]
  };
}

/**
 * 将表单配置转换为 UI 显示配置
 */
export function formConfigToDisplayConfig(form: LayoutConfigForm): LayoutConfigDisplay {
  return {
    coupletOrder: COUPLET_ORDER_REVERSE_MAP[form.coupletOrder],
    horizontalDirection: HORIZONTAL_DIRECTION_REVERSE_MAP[form.horizontalDirection],
    fuOrientation: FU_ORIENTATION_REVERSE_MAP[form.fuDirection]
  };
}

/**
 * 转换对联顺序：UI 显示 → 表单
 */
export function coupletOrderDisplayToForm(order: CoupletOrderDisplay): CoupletOrderForm {
  return COUPLET_ORDER_MAP[order];
}

/**
 * 转换对联顺序：表单 → UI 显示
 */
export function coupletOrderFormToDisplay(order: CoupletOrderForm): CoupletOrderDisplay {
  return COUPLET_ORDER_REVERSE_MAP[order];
}

/**
 * 转换横批方向：UI 显示 → 表单
 */
export function horizontalDirectionDisplayToForm(direction: HorizontalDirectionDisplay): HorizontalDirectionForm {
  return HORIZONTAL_DIRECTION_MAP[direction];
}

/**
 * 转换横批方向：表单 → UI 显示
 */
export function horizontalDirectionFormToDisplay(direction: HorizontalDirectionForm): HorizontalDirectionDisplay {
  return HORIZONTAL_DIRECTION_REVERSE_MAP[direction];
}

/**
 * 转换福字方向：UI 显示 → 表单
 */
export function fuOrientationDisplayToForm(orientation: FuOrientationDisplay): FuOrientationForm {
  return FU_ORIENTATION_MAP[orientation];
}

/**
 * 转换福字方向：表单 → UI 显示
 */
export function fuOrientationFormToDisplay(orientation: FuOrientationForm): FuOrientationDisplay {
  return FU_ORIENTATION_REVERSE_MAP[orientation];
}

/**
 * 将完整布局配置转换为表单数据格式
 */
export function layoutConfigToFormData(
  topic: string,
  wordCount: string,
  display: LayoutConfigDisplay
): FormData {
  const formConfig = displayConfigToFormConfig(display);
  return {
    topic,
    wordCount,
    coupletOrder: formConfig.coupletOrder,
    horizontalDirection: formConfig.horizontalDirection,
    fuDirection: formConfig.fuDirection
  };
}

/**
 * 将表单数据转换为布局配置（用于恢复 UI 状态）
 */
export function formDataToLayoutConfig(formData: FormData): LayoutConfigDisplay {
  return {
    wordCount: formData.wordCount,
    coupletOrder: COUPLET_ORDER_REVERSE_MAP[formData.coupletOrder],
    horizontalDirection: HORIZONTAL_DIRECTION_REVERSE_MAP[formData.horizontalDirection],
    fuOrientation: FU_ORIENTATION_REVERSE_MAP[formData.fuDirection]
  };
}
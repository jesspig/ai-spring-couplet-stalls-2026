/**
 * 获取颜色配置
 */
export function getSpringFestivalColors() {
  return {
    red: '#DC2626',
    gold: '#FFD700',
    goldDark: '#B8860B',
    paper: '#FEF3C7'
  };
}

/**
 * 对联参数
 */
export interface CoupletParams {
  /** 字体大小 */
  fontSize: number;
  /** 行高 */
  lineHeight: number;
  /** 内边距 */
  padding: number;
  /** 高度 */
  height: number;
}

/**
 * 根据对联字数计算自适应参数
 * @param text 对联文本
 * @returns 对联参数
 */
export function getCoupletParams(text: string): CoupletParams {
  const charCount = text.length;

  if (charCount <= 5) {
    const fontSize = 72;
    const lineHeight = 95;
    const textTotalHeight = (charCount - 1) * lineHeight;
    const padding = 70;
    const height = textTotalHeight + padding * 2;
    return { fontSize, lineHeight, padding, height };
  } else if (charCount <= 7) {
    const fontSize = 68;
    const lineHeight = 85;
    const textTotalHeight = (charCount - 1) * lineHeight;
    const padding = 70;
    const height = textTotalHeight + padding * 2;
    return { fontSize, lineHeight, padding, height };
  } else if (charCount <= 9) {
    const fontSize = 64;
    const lineHeight = 78;
    const textTotalHeight = (charCount - 1) * lineHeight;
    const padding = 70;
    const height = textTotalHeight + padding * 2;
    return { fontSize, lineHeight, padding, height };
  } else {
    const fontSize = 58;
    const lineHeight = 70;
    const textTotalHeight = (charCount - 1) * lineHeight;
    const padding = 70;
    const height = textTotalHeight + padding * 2;
    return { fontSize, lineHeight, padding, height };
  }
}

/**
 * 计算福字旋转角度
 * @param fuOrientation 福字方向
 * @returns 旋转角度
 */
export function getFuRotation(fuOrientation: string): { rotation: number; charRotation: number } {
  return {
    rotation: fuOrientation === 'inverted' ? 135 : -45,
    charRotation: fuOrientation === 'inverted' ? 180 : 0
  };
}
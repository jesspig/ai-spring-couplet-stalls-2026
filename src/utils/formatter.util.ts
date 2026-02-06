import type { GenerationStatus } from '../types/spring.types';

/**
 * 格式化时间戳为本地日期时间字符串
 * @param timestamp 时间戳（毫秒）
 * @param locale 本地化设置，默认为 'zh-CN'
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(
  timestamp: number,
  locale: string = 'zh-CN'
): string {
  const date = new Date(timestamp);
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 格式化日期为本地日期字符串
 * @param timestamp 时间戳（毫秒）
 * @param locale 本地化设置，默认为 'zh-CN'
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  timestamp: number,
  locale: string = 'zh-CN'
): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * 格式化时间为本地时间字符串
 * @param timestamp 时间戳（毫秒）
 * @param locale 本地化设置，默认为 'zh-CN'
 * @returns 格式化后的时间字符串
 */
export function formatTime(
  timestamp: number,
  locale: string = 'zh-CN'
): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * 获取相对时间描述
 * @param timestamp 时间戳（毫秒）
 * @returns 相对时间描述（如："刚刚"、"5分钟前"）
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes}分钟前`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}小时前`;
  } else if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return `${days}天前`;
  } else {
    return formatDate(timestamp);
  }
}

/**
 * 截断文本
 * @param text 原始文本
 * @param maxLength 最大长度
 * @param suffix 后缀，默认为 '...'
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 生成状态徽章的显示文本
 * @param status 生成状态
 * @returns 状态文本
 */
export function getStatusText(status: GenerationStatus): string {
  const statusMap: Record<GenerationStatus, string> = {
    pending: '进行中',
    completed: '成功',
    failed: '失败',
    aborted: '中止'
  };
  return statusMap[status] || status;
}

/**
 * 生成状态徽章的样式类名
 * @param status 生成状态
 * @returns 样式类名
 */
export function getStatusClass(status: GenerationStatus): string {
  return `status-${status}`;
}

/**
 * 获取状态徽章信息
 * @param status 生成状态
 * @returns 状态信息对象
 */
export function getStatusBadgeInfo(status: GenerationStatus): { text: string; className: string } {
  return {
    text: getStatusText(status),
    className: `status-badge ${getStatusClass(status)}`
  };
}

/**
 * 格式化百分比
 * @param value 数值
 * @param total 总数
 * @param decimals 小数位数，默认为 0
 * @returns 百分比字符串
 */
export function formatPercentage(value: number, total: number, decimals: number = 0): string {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * 首字母大写
 * @param text 文本
 * @returns 首字母大写的文本
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * 格式化数字（添加千位分隔符）
 * @param num 数字
 * @param locale 本地化设置，默认为 'zh-CN'
 * @returns 格式化后的数字字符串
 */
export function formatNumber(num: number, locale: string = 'zh-CN'): string {
  return num.toLocaleString(locale);
}
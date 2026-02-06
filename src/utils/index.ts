/**
 * 工具函数统一导出
 */

// 存储工具
export {
  StorageService,
  localStorageService,
  sessionStorageService,
  getLayoutConfig,
  saveLayoutConfig,
  getApiConfig,
  saveApiConfig,
  getCachedModels,
  saveCachedModels,
  getCachedSelectedModel,
  saveCachedSelectedModel,
  clearSessionData,
  LAYOUT_CONFIG_KEYS,
  API_CONFIG_KEYS,
  SESSION_DATA_KEYS
} from './storage.util';

// 布局配置工具
export {
  type CoupletOrderDisplay,
  type CoupletOrderForm,
  type HorizontalDirectionDisplay,
  type HorizontalDirectionForm,
  type FuOrientationDisplay,
  type FuOrientationForm,
  type LayoutConfigDisplay,
  type LayoutConfigForm,
  displayConfigToFormConfig,
  formConfigToDisplayConfig,
  coupletOrderDisplayToForm,
  coupletOrderFormToDisplay,
  horizontalDirectionDisplayToForm,
  horizontalDirectionFormToDisplay,
  fuOrientationDisplayToForm,
  fuOrientationFormToDisplay,
  layoutConfigToFormData,
  formDataToLayoutConfig
} from './layout-config.util';

// 格式化工具
export {
  formatDateTime,
  formatDate,
  formatTime,
  getRelativeTime,
  truncateText,
  formatFileSize,
  getStatusText,
  getStatusClass,
  getStatusBadgeInfo,
  formatPercentage,
  capitalize,
  formatNumber
} from './formatter.util';

// UUID 生成工具
export { generateUUID } from './uuid.util';

// JSON 解析工具
export { parseLLMJson } from './json-parser.util';
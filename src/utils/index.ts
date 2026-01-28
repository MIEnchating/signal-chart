/**
 * 工具函数统一导出
 */

// 数学计算
export { linearMap, calculateNiceTicks } from "./math"

// 布局计算
export { parsePercent, calculateRect } from "./layout"

// 格式化
export { formatNumber, formatFrequency, formatTime } from "./format"

// 配置管理
export { mergeOptions, deepEqual } from "./config"

// 配置规范化
export { normalizeAxis, normalizeChartOption } from "./normalize"

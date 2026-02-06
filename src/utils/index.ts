/**
 * 工具函数统一导出
 */

// 比例尺和坐标映射工具（内部使用 D3 实现，但不暴露 D3 API）
export { linearMap, batchLinearMap, createLinearScale, createColorScale, batchColorMap } from "./scale"
export type { ColorMapType } from "./scale"

// 布局计算
export { parsePercent, calculateRect } from "./layout"

// 格式化
export { formatNumber, formatFrequency, formatTime } from "./format"

// 配置管理
export { mergeOptions, deepEqual } from "./config"

// 配置规范化
export { normalizeAxis, normalizeChartOption } from "./normalize"

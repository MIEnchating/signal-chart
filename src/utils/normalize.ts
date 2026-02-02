/**
 * Option 规范化工具函数
 *
 * 注意：统一将单个对象转换为数组格式，支持未来多 grid/axis 扩展
 */

import type { AxisOption, ChartOption, XAxisOption, YAxisOption, GridOption } from "@/types"

/**
 * 规范化网格配置：统一转换为数组
 */
export function normalizeGrid(grid?: GridOption | GridOption[]): GridOption[] {
  if (!grid) return []
  return Array.isArray(grid) ? grid : [grid]
}

/**
 * 规范化 X 轴配置：统一转换为数组
 */
export function normalizeXAxis(axis?: XAxisOption | XAxisOption[]): XAxisOption[] {
  if (!axis) return []
  return Array.isArray(axis) ? axis : [axis]
}

/**
 * 规范化 Y 轴配置：统一转换为数组
 */
export function normalizeYAxis(axis?: YAxisOption | YAxisOption[]): YAxisOption[] {
  if (!axis) return []
  return Array.isArray(axis) ? axis : [axis]
}

/**
 * 规范化轴配置：将单个对象或数组统一转换为数组（向后兼容）
 */
export function normalizeAxis(axis: AxisOption | AxisOption[] | undefined): AxisOption[] {
  if (!axis) {
    return []
  }
  return Array.isArray(axis) ? axis : [axis]
}

/**
 * 规范化完整的 ChartOption
 *
 * 将所有配置统一转换为数组格式
 */
export function normalizeChartOption(option: any): ChartOption {
  return {
    ...option,
    grid: normalizeGrid(option.grid),
    xAxis: normalizeXAxis(option.xAxis),
    yAxis: normalizeYAxis(option.yAxis),
    series: option.series?.filter((s: any) => s !== undefined) ?? []
  }
}

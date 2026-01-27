/**
 * Option 规范化工具函数
 */

import { AxisOption, ChartOption, GridOption } from "@/core/type"
import { DeepPartial } from "./options"

/**
 * 规范化轴配置：将单个对象或数组统一转换为数组
 * @param axis 轴配置（可以是单个对象或数组）
 * @returns 轴配置数组
 */
export function normalizeAxis(axis: AxisOption | AxisOption[] | undefined): AxisOption[] {
  if (!axis) {
    return []
  }

  return Array.isArray(axis) ? axis : [axis]
}

/**
 * 规范化 Grid 配置：确保所有值都是有效的
 * @param grid Grid 配置
 * @returns 规范化后的 Grid 配置
 */
export function normalizeGrid(grid: Partial<GridOption> | undefined): GridOption {
  const defaultGrid: GridOption = {
    top: "10%",
    bottom: "10%",
    left: "10%",
    right: "10%"
  }

  if (!grid) {
    return defaultGrid
  }

  return {
    top: grid.top ?? defaultGrid.top,
    bottom: grid.bottom ?? defaultGrid.bottom,
    left: grid.left ?? defaultGrid.left,
    right: grid.right ?? defaultGrid.right
  }
}

/**
 * 规范化完整的 ChartOption
 * @param option 用户提供的配置
 * @returns 规范化后的配置
 */
export function normalizeChartOption(option: DeepPartial<ChartOption>): ChartOption {
  const normalized: ChartOption = {
    backgroundColor: option.backgroundColor ?? "#000",
    grid: normalizeGrid(option.grid),
    xAxis: normalizeAxis(option.xAxis as any)[0] || getDefaultAxis("bottom"),
    yAxis: normalizeAxis(option.yAxis as any)[0] || getDefaultAxis("left"),
    series: (option.series?.filter(s => s !== undefined) as any[]) ?? []
  }

  return normalized
}

/**
 * 获取默认轴配置
 * @param position 轴位置
 * @returns 默认轴配置
 */
function getDefaultAxis(position: "top" | "bottom" | "left" | "right"): AxisOption {
  return {
    show: true,
    type: "value",
    min: 0,
    max: 100,
    position,
    splitNumber: 5,
    axisLine: {
      show: true,
      color: "#fff"
    },
    axisTick: {
      show: true,
      length: 6,
      color: "#fff",
      splitNumber: 5
    },
    axisLabel: {
      show: true,
      color: "#fff",
      fontSize: 12
    }
  }
}

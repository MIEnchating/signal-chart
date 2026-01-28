import type { ChartOption } from "@/types"

/**
 * 获取顶层默认配置
 *
 * 注意：
 * - grid、xAxis、yAxis 的默认值由各自的 Model 管理
 * - 这里只提供顶层必需的默认值
 */
export function getDefaultOptions(): Partial<ChartOption> {
  return {
    backgroundColor: "#000",
    series: []
  }
}

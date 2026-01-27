import { ChartOption } from "./type"

/**
 * 获取顶层默认配置
 * 注意：组件级别的默认配置由各自的 Model 管理（GridModel, AxisModel 等）
 */
export function getDefaultOptions(): Partial<ChartOption> {
  return {
    backgroundColor: "#000"
  }
}

/**
 * 类型定义统一导出
 *
 * 从这里导入所有需要的类型
 * @example
 * import { ChartOption, ComponentType } from '@/types'
 */

// 核心类型
export type {
  ChartOption,
  InputChartOption,
  ZRenderInitOptions,
  GridOption,
  AxisOption,
  XAxisOption,
  YAxisOption,
  AxisLineOption,
  AxisTickOption,
  AxisLabelOption,
  AxisUnitOption,
  SeriesOption,
  SeriesType
} from "./core"

// 组件类型
export type { ComponentContext, ComponentConstructor, ComponentInstance } from "./component"
export { ComponentType } from "./component"

// Model 类型
export type { ModelContext } from "./model"

// 工具类型
export type { DeepPartial } from "./utils"

/**
 * 组件类型定义
 *
 * 包含组件相关的类型、接口和枚举
 */

import { GlobalModel } from "@/core/GlobalModel"
import type { ChartOption } from "./core"
import type { ModelContext } from "./model"
import { BaseChart } from "@/core/BaseChart"

/**
 * 组件类型枚举
 */
export enum ComponentType {
  Grid = "grid",
  XAxis = "xAxis",
  YAxis = "yAxis",
  VisualMap = "visualMap",
  Tooltip = "tooltip",
  LineSeries = "lineSeries",
  WaterfallSeries = "waterfallSeries"
}

/**
 * 组件上下文
 */
export interface ComponentContext {
  /** Chart 实例 */
  chart: BaseChart
  /** 全局配置模型 */
  globalModel: GlobalModel
}

/**
 * 组件构造函数类型
 */
export interface ComponentConstructor {
  new (context: ComponentContext): ComponentInstance
  dependencies?: ComponentType[]
}

/**
 * 组件实例接口
 */
export interface ComponentInstance {
  /** 组件类型 */
  type: ComponentType
  /** 是否需要更新（脏标记） */
  dirty: boolean
  /** 初始化组件 */
  init(): void
  /** 更新组件 */
  update(data: any): void
  /** 清除组件内容 */
  clear(): void
  /** 销毁组件 */
  destroy(): void
  /** 配置项更新 */
  onOptionUpdate(option: ChartOption): void
  /** 容器尺寸变化时调用 */
  onResize(context: Partial<ModelContext>): void
  /** 依赖注入钩子 */
  onDependenciesReady?(dependencies: Map<ComponentType, ComponentInstance>): void
}

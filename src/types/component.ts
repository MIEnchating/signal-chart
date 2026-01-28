/**
 * 组件类型定义
 *
 * 包含组件相关的类型、接口和枚举
 */

import type { ZRenderType } from "zrender"
import type { ChartOption } from "./core"

/**
 * 组件类型枚举
 */
export enum ComponentType {
  Grid = "grid",
  XAxis = "xAxis",
  YAxis = "yAxis"
}

/**
 * 组件上下文
 */
export interface ComponentContext {
  /** ZRender 渲染器实例 */
  zr: ZRenderType
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
  /** 依赖注入钩子 */
  onDependenciesReady?(dependencies: Map<ComponentType, ComponentInstance>): void
}

import { ChartOption } from "@/core/type"
import { ZRenderType } from "zrender"

// 组件规范接口
export abstract class ComponentSpec {
  // 组件名称
  abstract type: ComponentType
  // 是否需要更新
  dirty: boolean = true
  // 渲染器
  protected zr: ZRenderType
  constructor(context: ComponentContext) {
    this.zr = context.zr
  }
  // 初始化组件
  abstract init(): void
  // 更新组件
  abstract update(data: any): void
  // 清除组件内容
  abstract clear(): void
  // 销毁组件
  abstract destroy(): void
  // 配置项更新
  abstract onOptionUpdate(option: ChartOption): void
}

export interface ComponentContext {
  zr: ZRenderType
}

// 内置的组件名称
export enum ComponentType {
  Grid = "grid",
  XAxis = "xAxis",
  YAxis = "yAxis"
}

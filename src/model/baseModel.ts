/**
 * 组件 Model 基类 - 负责数据处理和计算
 */

import { ChartOption } from "@/core/type"

export interface ModelContext {
  containerWidth: number
  containerHeight: number
}

/**
 * 组件 Model 抽象类
 */
export abstract class ComponentModel<T = any> {
  protected option: T
  protected context: ModelContext
  public dirty: boolean = true

  constructor(context: ModelContext) {
    this.context = context
    this.option = this.getDefaultOption()
  }

  /**
   * 获取默认配置（子类实现）
   */
  protected abstract getDefaultOption(): T

  /**
   * 从全局 ChartOption 中提取当前组件需要的配置
   * @param globalOption 全局配置
   */
  protected abstract extractOption(globalOption: ChartOption): T | undefined

  /**
   * 更新配置
   * @param globalOption 全局配置
   */
  public updateOption(globalOption: ChartOption): void {
    const newOption = this.extractOption(globalOption)

    if (newOption && this.shouldUpdate(newOption)) {
      this.option = this.mergeOption(newOption)
      this.dirty = true
    }
  }

  /**
   * 判断是否需要更新
   */
  protected shouldUpdate(newOption: T): boolean {
    return JSON.stringify(this.option) !== JSON.stringify(newOption)
  }

  /**
   * 合并配置（可被子类覆盖）
   */
  protected mergeOption(newOption: T): T {
    return { ...this.option, ...newOption }
  }

  /**
   * 获取当前配置
   */
  public getOption(): T {
    return this.option
  }

  /**
   * 更新上下文（如容器尺寸变化）
   */
  public updateContext(context: Partial<ModelContext>): void {
    this.context = { ...this.context, ...context }
    this.dirty = true
  }
}

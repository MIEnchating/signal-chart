/**
 * 组件 Model 基类 - 负责数据处理和计算
 */

import type { ChartOption, ModelContext } from "@/types"
import { deepEqual } from "@/utils/config"

/**
 * 组件 Model 抽象类
 */
export abstract class ComponentModel<T = any> {
  protected option: T | null = null
  protected context: ModelContext

  constructor(context: ModelContext) {
    this.context = context
  }

  /**
   * 从全局 ChartOption 中提取当前组件需要的配置
   * @param globalOption 全局配置
   */
  protected abstract extractOption(globalOption: ChartOption): T | undefined

  /**
   * 更新配置
   * @param globalOption 全局配置
   * @returns 是否有变化
   */
  public updateOption(globalOption: ChartOption): boolean {
    const newOption = this.extractOption(globalOption)

    // 如果没有提供配置，保持当前状态
    if (newOption === undefined || newOption === null) {
      return false
    }

    // 对于数组类型，如果是空数组也认为是无效配置
    if (Array.isArray(newOption) && newOption.length === 0 && !this.option) {
      return false
    }

    // 首次设置或配置变化
    if (!this.option || this.shouldUpdate(newOption)) {
      this.option = newOption as T
      return true
    }

    return false
  }

  /**
   * 判断是否需要更新
   */
  protected shouldUpdate(newOption: T): boolean {
    return !deepEqual(this.option, newOption)
  }

  /**
   * 获取当前配置
   */
  public getOption(): T {
    return this.option!
  }

  /**
   * 更新上下文（如容器尺寸变化）
   * @returns 是否有变化
   */
  public updateContext(context: Partial<ModelContext>): boolean {
    this.context = { ...this.context, ...context }
    return true
  }
}

/**
 * 组件 Model 基类 - 负责数据处理和计算
 */

import type { ChartOption, ModelContext } from "@/types"
import { mergeOptions, deepEqual } from "@/utils/config"

/**
 * 组件 Model 抽象类
 */
export abstract class ComponentModel<T = any> {
  protected option: T
  protected context: ModelContext

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
   * @returns 是否有变化
   */
  public updateOption(globalOption: ChartOption): boolean {
    const newOption = this.extractOption(globalOption)

    // 如果没有提供配置，保持当前状态（不修改 dirty）
    // 返回 null 表示"无法判断"，让组件自己决定
    if (!newOption) {
      return false
    }

    // 有配置时才进行比较
    if (this.shouldUpdate(newOption)) {
      // 使用工具类的深度合并函数
      this.option = mergeOptions(this.option, newOption as any)
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
    return this.option
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

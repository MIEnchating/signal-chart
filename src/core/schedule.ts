import { DeepPartial, mergeOptions } from "@/utils/options"
import { ComponentManager } from "./componentManage"
import { ChartOption } from "./type"
import { getDefaultOptions } from "./options"
import { normalizeChartOption } from "@/utils/normalize"

export class Scheduler {
  private componentManager: ComponentManager
  private _option: ChartOption

  constructor(componentManager: ComponentManager, initialOption: DeepPartial<ChartOption>) {
    this.componentManager = componentManager
    this._option = this.normalizeOption(initialOption)
  }

  /**
   * 获取当前已规范化的配置项
   * 用户通过 Chart.getOption() 调用时应该得到这个规范化后的配置
   */
  public get option(): ChartOption {
    return this._option
  }

  // 处理 option 更新
  public processOption(newOption: DeepPartial<ChartOption>): void {
    this._option = this.normalizeOption(newOption)

    // 通知各组件更新
    this.componentManager.notifyAll(this._option)

    this.flush()
  }

  private flush(): void {
    this.componentManager.updateAll(this._option)
  }

  /**
   * 规范化配置项
   * 注意：组件级别的默认配置由各自的 Model 管理（GridModel.getDefaultOption 等）
   */
  private normalizeOption(option: DeepPartial<ChartOption>): ChartOption {
    let merged: ChartOption
    if (this._option) {
      merged = mergeOptions(this._option, option)
    } else {
      // 只合并顶层默认配置（如 backgroundColor）
      merged = mergeOptions(getDefaultOptions(), option) as ChartOption
    }
    // 规范化：统一轴配置格式（数组化等）
    return normalizeChartOption(merged)
  }
}

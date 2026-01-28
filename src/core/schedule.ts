import type { InputChartOption, ChartOption } from "@/types"
import { ComponentManager } from "./componentManage"
import { GlobalModel } from "./globalModel"

export class Scheduler {
  private componentManager: ComponentManager
  private globalModel: GlobalModel

  constructor(componentManager: ComponentManager) {
    this.componentManager = componentManager
    this.globalModel = new GlobalModel()
  }

  /**
   * 获取当前配置（直接从 GlobalModel 返回）
   */
  public getOption(): ChartOption {
    return this.globalModel.getOption()
  }

  /**
   * 处理 option 更新
   */
  public processOption(newOption: InputChartOption): void {
    // 更新 GlobalModel
    this.globalModel.mergeOption(newOption)

    // 获取完整配置
    const fullOption = this.globalModel.getOption()

    // 通知各组件更新配置
    this.componentManager.notifyAll(fullOption)

    // 执行渲染
    this.flush(fullOption)
  }

  private flush(option: ChartOption): void {
    this.componentManager.updateAll(option)
  }
}

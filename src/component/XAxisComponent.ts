/**
 * XAxis 组件 - X 轴组件
 */

import type { ChartOption, ComponentContext, AxisOption } from "@/types"
import { BaseComponent } from "./BaseComponent"
import { ComponentType } from "@/types"
import { AxisModel } from "@/model/AxisModel"
import { AxisView } from "@/view/axisView"
import { GridComponent } from "./GridComponent"
import { Inject } from "@/core/decorators"

/**
 * XAxisModel - X 轴专用 Model
 */
class XAxisModel extends AxisModel {
  protected extractOption(globalOption: ChartOption): AxisOption[] {
    return globalOption.xAxis || []
  }
}

/**
 * XAxisComponent - X 轴组件
 */
export class XAxisComponent extends BaseComponent {
  type = ComponentType.XAxis

  private model: XAxisModel
  private view: AxisView

  // 使用装饰器自动注入 Grid 组件
  @Inject(ComponentType.Grid)
  private gridComponent!: GridComponent

  constructor(context: ComponentContext) {
    super(context)

    const width = this.chart.getWidth()
    const height = this.chart.getHeight()

    this.model = new XAxisModel({ containerWidth: width, containerHeight: height })
    this.view = new AxisView(this.chart.getZr())
  }

  init(): void {
    this.view.init()
  }

  update(_data?: any): void {
    if (!this.dirty) {
      return
    }
    // 确保有 GridModel
    if (this.gridComponent) {
      const gridModel = this.gridComponent.getGridModel()
      this.model.setGridModel(gridModel)
      this.view.setGridModel(gridModel)
    }

    this.view.render(this.model)
    this.dirty = false
  }

  clear(): void {
    this.view.clear()
  }

  destroy(): void {
    this.view.destroy()
  }

  /**
   * 获取 AxisModel
   */
  protected getModel(): AxisModel {
    return this.model
  }

  /**
   * 公开 API：获取 AxisModel
   */
  public getAxisModel(): AxisModel {
    return this.model
  }
}

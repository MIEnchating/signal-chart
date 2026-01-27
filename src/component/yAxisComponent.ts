/**
 * YAxis 组件 - Y 轴组件
 */

import { ChartOption } from "@/core/type"
import { ComponentContext, ComponentSpec, ComponentType } from "./component"
import { AxisModel } from "@/model/axisModel"
import { AxisView } from "@/view/axisView"
import { GridComponent } from "./gridComponent"

/**
 * YAxisModel - Y 轴专用 Model
 */
class YAxisModel extends AxisModel {
  protected extractOption(globalOption: ChartOption) {
    const yAxis = Array.isArray(globalOption.yAxis) ? globalOption.yAxis[0] : globalOption.yAxis
    return yAxis
  }
}

/**
 * YAxisComponent - Y 轴组件
 */
export class YAxisComponent extends ComponentSpec {
  type = ComponentType.YAxis
  private model: YAxisModel
  private view: AxisView
  private gridComponent: GridComponent | null = null

  constructor(context: ComponentContext) {
    super(context)

    const width = this.zr.getWidth() || 800
    const height = this.zr.getHeight() || 600

    this.model = new YAxisModel({ containerWidth: width, containerHeight: height })
    this.view = new AxisView(this.zr)
  }

  init(): void {
    this.view.init()
    this.dirty = false
  }

  update(_data?: any): void {
    if (!this.dirty) return

    // 确保有 GridModel
    if (this.gridComponent) {
      this.model.setGridModel(this.gridComponent.getModel())
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

  onOptionUpdate(option: ChartOption): void {
    this.model.updateOption(option)

    if (this.model.dirty) {
      this.dirty = true
      this.model.dirty = false
    }
  }

  /**
   * 设置关联的 GridComponent
   */
  public setGridComponent(gridComponent: GridComponent): void {
    this.gridComponent = gridComponent
  }

  /**
   * 获取 AxisModel
   */
  public getModel(): AxisModel {
    return this.model
  }
}

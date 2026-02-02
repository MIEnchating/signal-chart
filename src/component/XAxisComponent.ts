/**
 * XAxis 组件 - X 轴组件
 */

import type { ChartOption, ComponentContext, ComponentInstance, AxisOption } from "@/types"
import { BaseComponent } from "./BaseComponent"
import { ComponentType } from "@/types"
import { AxisModel } from "@/model/AxisModel"
import { AxisView } from "@/view/axisView"
import { GridComponent } from "./GridComponent"

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

  // 声明依赖：需要 Grid 组件
  static dependencies = [ComponentType.Grid]

  private model: XAxisModel
  private view: AxisView
  private gridComponent: GridComponent | null = null

  constructor(context: ComponentContext) {
    super(context)

    const width = this.chart.getWidth()
    const height = this.chart.getHeight()

    this.model = new XAxisModel({ containerWidth: width, containerHeight: height })
    this.view = new AxisView(this.chart.getZr())
  }

  /**
   * 依赖注入钩子：自动获取 Grid 组件
   */
  onDependenciesReady(dependencies: Map<ComponentType, ComponentInstance>): void {
    this.gridComponent = dependencies.get(ComponentType.Grid) as unknown as GridComponent
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
      this.model.setGridModel(this.gridComponent.getGridModel())
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

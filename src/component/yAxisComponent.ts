/**
 * YAxis 组件 - Y 轴组件
 */

import type { ChartOption, ComponentContext, ComponentInstance, YAxisOption } from "@/types"
import { BaseComponent } from "./baseComponent"
import { ComponentType } from "@/types"
import { AxisModel } from "@/model/axisModel"
import { AxisView } from "@/view/axisView"
import { GridComponent } from "./gridComponent"

/**
 * YAxisModel - Y 轴专用 Model
 */
class YAxisModel extends AxisModel {
  protected getDefaultOption(): YAxisOption {
    return {
      show: true,
      type: "value",
      min: 0,
      max: 100,
      position: "left",
      splitNumber: 5,
      axisLine: {
        show: true,
        color: "#fff"
      },
      axisTick: {
        show: true,
        length: 6,
        color: "#fff",
        splitNumber: 5
      },
      axisLabel: {
        show: true,
        color: "#fff",
        fontSize: 12
      }
    }
  }

  protected extractOption(globalOption: ChartOption): YAxisOption | undefined {
    const yAxis = Array.isArray(globalOption.yAxis) ? globalOption.yAxis[0] : globalOption.yAxis
    return yAxis
  }
}

/**
 * YAxisComponent - Y 轴组件
 */
export class YAxisComponent extends BaseComponent {
  type = ComponentType.YAxis

  // 声明依赖：需要 Grid 组件
  static dependencies = [ComponentType.Grid]

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

  /**
   * 依赖注入钩子：自动获取 Grid 组件
   */
  onDependenciesReady(dependencies: Map<ComponentType, ComponentInstance>): void {
    this.gridComponent = dependencies.get(ComponentType.Grid) as unknown as GridComponent
  }

  init(): void {
    this.view.init()
    // 保持 dirty = true，等待首次渨染
  }

  update(_data?: any): void {
    if (!this.dirty) {
      console.log(`  ⏭️  [${this.type}] update() 被调用但 dirty=false，跳过渲染`)
      return
    }

    console.log(`  ✏️  [${this.type}] 执行 view.render()`)
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

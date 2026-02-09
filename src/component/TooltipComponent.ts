/**
 * Tooltip 组件 - 提示框组件
 */

import type { ComponentContext } from "@/types"
import { BaseComponent } from "./BaseComponent"
import { ComponentType } from "@/types"
import { TooltipModel } from "@/model/TooltipModel"
import { TooltipView } from "@/view/tooltipView"
import { GridComponent } from "./GridComponent"
import { XAxisComponent } from "./XAxisComponent"
import { YAxisComponent } from "./YAxisComponent"
import { Inject } from "@/core/decorators"

/**
 * TooltipComponent - 提示框组件
 */
export class TooltipComponent extends BaseComponent {
  type = ComponentType.Tooltip

  private model: TooltipModel
  private view: TooltipView

  // 注入依赖组件
  @Inject(ComponentType.Grid)
  private gridComponent!: GridComponent

  @Inject(ComponentType.XAxis)
  private xAxisComponent!: XAxisComponent

  @Inject(ComponentType.YAxis)
  private yAxisComponent!: YAxisComponent

  constructor(context: ComponentContext) {
    super(context)

    const width = this.chart.getWidth()
    const height = this.chart.getHeight()

    this.model = new TooltipModel({ containerWidth: width, containerHeight: height })
    this.view = new TooltipView(this.chart.getZr())
  }

  init(): void {
    this.view.init()

    // 设置依赖
    if (this.gridComponent && this.xAxisComponent && this.yAxisComponent) {
      this.view.setDependencies(
        this.gridComponent.getGridModel(),
        this.xAxisComponent.getAxisModel(),
        this.yAxisComponent.getAxisModel()
      )
    }

    // 绑定鼠标事件
    this.bindEvents()
  }

  update(_data?: any): void {
    if (!this.dirty) {
      return
    }

    this.view.updateOption(this.model.getTooltipOption())
    this.dirty = false
  }

  clear(): void {
    this.view.clear()
  }

  destroy(): void {
    this.unbindEvents()
    this.view.destroy()
  }

  /**
   * 绑定鼠标事件
   */
  private bindEvents(): void {
    const zr = this.chart.getZr()
    const dom = zr.dom

    if (!dom) return

    // 鼠标移动事件
    dom.addEventListener('mousemove', this.handleMouseMove)
    // 鼠标离开事件
    dom.addEventListener('mouseleave', this.handleMouseLeave)
  }

  /**
   * 解绑鼠标事件
   */
  private unbindEvents(): void {
    const zr = this.chart.getZr()
    const dom = zr.dom

    if (!dom) return

    dom.removeEventListener('mousemove', this.handleMouseMove)
    dom.removeEventListener('mouseleave', this.handleMouseLeave)
  }

  /**
   * 处理鼠标移动
   */
  private handleMouseMove = (e: MouseEvent): void => {
    const option = this.model.getOption()
    if (!option || !option.show || option.trigger === 'none') {
      return
    }

    const zr = this.chart.getZr()
    const dom = zr.dom
    if (!dom) return

    // 获取鼠标在 canvas 中的坐标
    const rect = dom.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 更新 Tooltip
    this.view.show(x, y, this.chart.getOption())
  }

  /**
   * 处理鼠标离开
   */
  private handleMouseLeave = (): void => {
    this.view.hide()
  }

  /**
   * 获取 TooltipModel
   */
  protected getModel(): TooltipModel {
    return this.model
  }
}

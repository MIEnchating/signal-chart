/**
 * VisualMapComponent - 视觉映射组件
 *
 * 职责：
 * - 管理 VisualMap 的生命周期
 * - 协调 Model 和 View
 * - 独立于 Series，可复用
 */

import type { ComponentContext } from "@/types"
import { BaseComponent } from "./BaseComponent"
import { ComponentType } from "@/types/component"
import { VisualMapModel } from "@/model/VisualMapModel"
import { VisualMapView } from "@/view/visualMapView"

export class VisualMapComponent extends BaseComponent {
  public readonly type = ComponentType.VisualMap

  private model: VisualMapModel
  private view: VisualMapView

  constructor(context: ComponentContext) {
    super(context)

    // 获取容器尺寸
    const containerWidth = this.chart.getWidth()
    const containerHeight = this.chart.getHeight()

    // 创建 Model 和 View
    this.model = new VisualMapModel({ containerWidth, containerHeight })
    this.view = new VisualMapView(this.chart.getZr())
  }

  public init(): void {
    this.view.init()
  }

  public update(_data?: any): void {
    if (!this.dirty) return

    // 获取第一个 visualMap 的渲染数据
    const renderItem = this.model.getRenderItem(0)

    // 渲染
    this.view.render(renderItem)

    this.dirty = false
  }

  public clear(): void {
    this.view.clear()
  }

  public destroy(): void {
    this.view.destroy()
  }

  /**
   * 获取 Model（用于基类的通用逻辑）
   */
  protected getModel() {
    return this.model
  }

  /**
   * 获取关联的 series 索引列表
   */
  public getSeriesIndices(index: number = 0): number[] {
    return this.model.getSeriesIndices(index)
  }

  /**
   * 获取 visualMap 配置
   */
  public getVisualMapOption(index: number = 0) {
    return this.model.getVisualMapOption(index)
  }
}

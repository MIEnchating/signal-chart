/**
 * Grid 组件 - 网格布局组件（Model + View 架构）
 */

import type { ComponentContext } from "@/types"
import { BaseComponent } from "./BaseComponent"
import { ComponentType } from "@/types"
import { GridModel, GridRect } from "@/model/GridModel"
import { GridView } from "@/view/gridView"

export class GridComponent extends BaseComponent {
  type = ComponentType.Grid
  private model: GridModel
  private view: GridView

  constructor(context: ComponentContext) {
    super(context)

    // 获取容器尺寸
    const width = this.chart.getWidth()
    const height = this.chart.getHeight()

    // 创建 Model 和 View
    this.model = new GridModel({ containerWidth: width, containerHeight: height })
    this.view = new GridView(this.chart.getZr())
  }

  init(): void {
    this.view.init()
  }

  update(_data?: any): void {
    if (!this.dirty) {
      return
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
   * 获取 GridModel（供其他组件使用）
   */
  protected getModel(): GridModel {
    return this.model
  }

  /**
   * 公开 API：获取 GridModel
   */
  public getGridModel(): GridModel {
    return this.model
  }

  /**
   * 获取指定索引的 Grid 矩形区域
   */
  public getGridRect(gridIndex: number = 0): GridRect {
    return this.model.getRect(gridIndex)
  }
}

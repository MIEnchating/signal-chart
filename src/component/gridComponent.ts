/**
 * Grid 组件 - 网格布局组件（Model + View 架构）
 */

import { ChartOption } from "@/core/type"
import { ComponentContext, ComponentSpec, ComponentType } from "./component"
import { GridModel } from "@/model/gridModel"
import { GridView } from "@/view/gridView"

export class GridComponent extends ComponentSpec {
  type = ComponentType.Grid
  private model: GridModel
  private view: GridView

  constructor(context: ComponentContext) {
    super(context)

    // 获取容器尺寸
    const width = this.zr.getWidth() || 800
    const height = this.zr.getHeight() || 600

    // 创建 Model 和 View
    this.model = new GridModel({ containerWidth: width, containerHeight: height })
    this.view = new GridView(this.zr)
  }

  init(): void {
    this.view.init()
    this.dirty = false
  }

  update(_data?: any): void {
    if (!this.dirty) return

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
    // 更新 Model
    this.model.updateOption(option)

    // 标记需要更新
    if (this.model.dirty) {
      this.dirty = true
      this.model.dirty = false
    }
  }

  /**
   * 获取 GridModel（供其他组件使用）
   */
  public getModel(): GridModel {
    return this.model
  }
}

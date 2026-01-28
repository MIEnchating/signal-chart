/**
 * Grid 组件 - 网格布局组件（Model + View 架构）
 */

import type { ComponentContext } from "@/types"
import { BaseComponent } from "./baseComponent"
import { ComponentType } from "@/types"
import { GridModel } from "@/model/gridModel"
import { GridView } from "@/view/gridView"

export class GridComponent extends BaseComponent {
  type = ComponentType.Grid
  private model: GridModel
  private view: GridView

  constructor(context: ComponentContext) {
    super(context)

    // 获取容器尺寸
    const width = this.zr.getWidth()!
    const height = this.zr.getHeight()!

    // 创建 Model 和 View
    this.model = new GridModel({ containerWidth: width, containerHeight: height })
    this.view = new GridView(this.zr)
  }

  init(): void {
    this.view.init()
    // 保持 dirty = true，等待首次渲染
  }

  update(_data?: any): void {
    if (!this.dirty) {
      console.log(`  ⏭️  [${this.type}] update() 被调用但 dirty=false，跳过渲染`)
      return
    }
    console.log(`  ✏️  [${this.type}] 执行 view.render()`)
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
}

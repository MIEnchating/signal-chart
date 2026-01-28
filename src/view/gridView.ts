/**
 * Grid 组件 View - 渲染网格
 */

import { ComponentView } from "./baseView"
import { GridModel } from "@/model/GridModel"
import { Rect } from "zrender"

/**
 * GridView - 负责绘制 Grid 背景和边框
 */
export class GridView extends ComponentView<GridModel> {
  /**
   * 根据 GridModel 渲染所有网格
   */
  public render(model: GridModel): void {
    this.clear()

    const options = model.getOption()
    if (!options || options.length === 0) {
      return
    }

    // 渲染所有 grid
    options.forEach((gridOption, index) => {
      const rect = model.getRect(index)

      // 创建背景矩形
      const backgroundRect = new Rect({
        shape: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        },
        style: {
          fill: "transparent",
          stroke: "#444",
          lineWidth: 1
        },
        silent: true, // 不响应事件
        zlevel: gridOption.zlevel ?? 0,
        z: gridOption.z ?? 2
      })

      // 如果有 id，设置 name 属性便于调试
      if (gridOption.id) {
        backgroundRect.name = `grid-${gridOption.id}`
      }

      this.group.add(backgroundRect)
    })
  }
}

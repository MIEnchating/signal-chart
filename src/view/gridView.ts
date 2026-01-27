/**
 * Grid 组件 View - 渲染网格
 */

import { ComponentView } from "./baseView"
import { GridModel } from "@/model/gridModel"
import { Rect } from "zrender"

/**
 * GridView - 负责绘制 Grid 背景和边框
 */
export class GridView extends ComponentView<GridModel> {
  private backgroundRect: Rect | null = null

  /**
   * 根据 GridModel 渲染网格
   */
  public render(model: GridModel): void {
    this.clear()

    const rect = model.getRect()

    // 创建背景矩形
    this.backgroundRect = new Rect({
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
      z: 0 // 层级最低
    })

    this.group.add(this.backgroundRect)
  }

  /**
   * 清除渲染内容
   */
  public clear(): void {
    super.clear()
    this.backgroundRect = null
  }
}

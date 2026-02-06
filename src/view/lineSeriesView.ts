/**
 * Line Series View - 线图渲染
 */

import { Polyline, Rect } from "zrender"
import type { ZRenderType } from "zrender"
import type { LineSeriesRenderItem } from "@/types"
import type { GridRect } from "@/model/GridModel"
import { ComponentView } from "./baseView"

/**
 * LineSeriesView - 负责绘制折线图
 * 使用对象池复用 Polyline 实例，避免高频更新时的 GC 压力
 */
export class LineSeriesView extends ComponentView<LineSeriesRenderItem[]> {
  /** 对象池：复用 Polyline 实例 */
  private polylinePool: Polyline[] = []

  constructor(zr: ZRenderType) {
    super(zr)
  }

  public render(items: LineSeriesRenderItem[]): void {
    // 统计需要渲染的有效 series 数量
    const visibleItems = items.filter(item => item.show && item.points.length > 0)
    const needed = visibleItems.length
    const poolSize = this.polylinePool.length

    // 复用或创建 Polyline
    visibleItems.forEach((item, i) => {
      if (i < poolSize) {
        // 复用已有对象：只更新属性
        const polyline = this.polylinePool[i]
        polyline.setShape({
          points: item.points,
          smooth: item.smooth ? 0.4 : 0
        })
        polyline.setStyle({
          stroke: item.lineStyle.color,
          lineWidth: item.lineStyle.width
        })
        polyline.zlevel = item.zlevel ?? 0
        polyline.z = item.z ?? 0
        polyline.show()
      } else {
        // 池中不够，创建新对象
        const polyline = new Polyline({
          shape: {
            points: item.points,
            smooth: item.smooth ? 0.4 : 0
          },
          style: {
            stroke: item.lineStyle.color,
            lineWidth: item.lineStyle.width,
            fill: "none",
            lineJoin: "round",
            lineCap: "round"
          },
          zlevel: item.zlevel ?? 0,
          z: item.z ?? 0,
          silent: true
        })
        this.polylinePool.push(polyline)
        this.group.add(polyline)
      }
    })

    // 隐藏多余的对象（不销毁，留在池中）
    for (let i = needed; i < poolSize; i++) {
      this.polylinePool[i].hide()
    }
  }

  /**
   * 设置裁剪区域（基于 Grid 矩形）
   * 超出此区域的线段会被自动裁剪
   */
  public setClipRect(rect: GridRect): void {
    this.group.setClipPath(
      new Rect({
        shape: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        }
      })
    )
  }

  /**
   * 清除渲染内容（重置对象池）
   */
  public clear(): void {
    this.polylinePool = []
    this.group.removeAll()
  }
}

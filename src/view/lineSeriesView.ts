/**
 * Line Series View - 线图渲染
 */

import { Polyline, Group } from "zrender"
import type { LineSeriesRenderItem } from "@/types"

export class LineSeriesView {
  private zr: any
  private group: any

  constructor(zr: any) {
    this.zr = zr
    this.group = new Group()
  }

  public init(): void {
    this.zr.add(this.group)
  }

  public render(items: LineSeriesRenderItem[]): void {
    this.clear()

    items.forEach(item => {
      if (!item.show || item.points.length === 0) {
        return
      }

      const polyline = new Polyline({
        shape: {
          points: item.points,
          smooth: item.smooth ? 0.4 : 0 // smooth 范围 0-1，0.4 是适中的平滑度
        },
        style: {
          stroke: item.lineStyle.color,
          lineWidth: item.lineStyle.width,
          fill: "none",
          lineJoin: "round", // 使用圆角连接，避免尖角超出边界
          lineCap: "round" // 线条端点也使用圆角
        },
        zlevel: item.zlevel ?? 0,
        z: item.z ?? 0,
        silent: true
      })

      this.group.add(polyline)
    })
  }

  public clear(): void {
    this.group.removeAll()
  }

  public destroy(): void {
    this.clear()
    this.zr.remove(this.group)
  }
}

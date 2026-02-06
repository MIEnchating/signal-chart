/**
 * VisualMapView - 视觉映射组件视图
 *
 * 职责：
 * - 渲染色卡（ColorBar）
 * - 渲染刻度和标签
 * - 渲染单位文本
 */

import { Image as ZImage, Rect, Text, Line } from "zrender"
import type { ZRenderType } from "zrender"
import type { VisualMapRenderItem } from "@/types"
import { ComponentView } from "./baseView"
import { createColorScale, type ColorMapType } from "@/utils/scale"

/**
 * VisualMapView - 负责绘制视觉映射色卡
 */
export class VisualMapView extends ComponentView<VisualMapRenderItem | null> {
  /** 色卡相关元素 */
  private colorBarElements: (ZImage | Text | Line | Rect)[] = []

  /** 上一次的色卡配置（用于判断是否需要重绘） */
  private lastColorBarKey: string = ""

  constructor(zr: ZRenderType) {
    super(zr)
  }

  /**
   * 渲染视觉映射色卡
   */
  public render(item: VisualMapRenderItem | null): void {
    // 如果没有数据或不显示，清除色卡
    if (!item || !item.show) {
      this.clearColorBar()
      return
    }

    // 生成色卡配置的唯一标识
    const colorBarKey = `${item.colorMap}-${item.valueRange[0]}-${item.valueRange[1]}-${item.rect.x}-${item.rect.y}-${item.rect.width}-${item.rect.height}`

    // 如果配置没变，不重绘
    if (colorBarKey === this.lastColorBarKey && this.colorBarElements.length > 0) {
      return
    }

    this.lastColorBarKey = colorBarKey

    // 先清除旧的色卡元素
    this.clearColorBar()

    const { colorMap, valueRange, rect, orient, splitNumber, textStyle, unit, zlevel, z } = item

    // 创建色卡渐变 Canvas
    const colorBarCanvas = this.createColorBarCanvas(
      colorMap as ColorMapType,
      valueRange,
      rect.width,
      rect.height,
      orient
    )

    // 色卡图像
    const colorBarImage = new ZImage({
      style: {
        image: colorBarCanvas,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      },
      zlevel: zlevel ?? 0,
      z: z ?? 10,
      silent: true
    })
    this.colorBarElements.push(colorBarImage)
    this.group.add(colorBarImage)

    // 色卡边框
    const border = new Rect({
      shape: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      },
      style: {
        fill: "none",
        stroke: "#666",
        lineWidth: 1
      },
      zlevel: zlevel ?? 0,
      z: (z ?? 10) + 1,
      silent: true
    })
    this.colorBarElements.push(border)
    this.group.add(border)

    // 渲染刻度和标签
    if (orient === "vertical") {
      this.renderVerticalTicks(rect, valueRange, splitNumber, textStyle, zlevel, z)
    } else {
      this.renderHorizontalTicks(rect, valueRange, splitNumber, textStyle, zlevel, z)
    }

    // 渲染单位标签
    if (unit?.show) {
      this.renderUnit(rect, orient, unit, zlevel, z)
    }
  }

  /**
   * 渲染垂直方向的刻度和标签
   */
  private renderVerticalTicks(
    rect: { x: number; y: number; width: number; height: number },
    valueRange: [number, number],
    splitNumber: number,
    textStyle: { color: string; fontSize: number },
    zlevel?: number,
    z?: number
  ): void {
    const [minVal, maxVal] = valueRange

    for (let i = 0; i <= splitNumber; i++) {
      const ratio = i / splitNumber
      const y = rect.y + rect.height * (1 - ratio) // 从下到上
      const value = minVal + (maxVal - minVal) * ratio

      // 刻度线
      const tick = new Line({
        shape: {
          x1: rect.x + rect.width,
          y1: y,
          x2: rect.x + rect.width + 4,
          y2: y
        },
        style: {
          stroke: "#999",
          lineWidth: 1
        },
        zlevel: zlevel ?? 0,
        z: (z ?? 10) + 1,
        silent: true
      })
      this.colorBarElements.push(tick)
      this.group.add(tick)

      // 标签
      const label = new Text({
        style: {
          text: value.toFixed(0),
          x: rect.x + rect.width + 6,
          y: y,
          fontSize: textStyle.fontSize,
          fill: textStyle.color,
          align: "left",
          verticalAlign: "middle"
        },
        zlevel: zlevel ?? 0,
        z: (z ?? 10) + 1,
        silent: true
      })
      this.colorBarElements.push(label)
      this.group.add(label)
    }
  }

  /**
   * 渲染水平方向的刻度和标签
   */
  private renderHorizontalTicks(
    rect: { x: number; y: number; width: number; height: number },
    valueRange: [number, number],
    splitNumber: number,
    textStyle: { color: string; fontSize: number },
    zlevel?: number,
    z?: number
  ): void {
    const [minVal, maxVal] = valueRange

    for (let i = 0; i <= splitNumber; i++) {
      const ratio = i / splitNumber
      const x = rect.x + rect.width * ratio // 从左到右
      const value = minVal + (maxVal - minVal) * ratio

      // 刻度线
      const tick = new Line({
        shape: {
          x1: x,
          y1: rect.y + rect.height,
          x2: x,
          y2: rect.y + rect.height + 4
        },
        style: {
          stroke: "#999",
          lineWidth: 1
        },
        zlevel: zlevel ?? 0,
        z: (z ?? 10) + 1,
        silent: true
      })
      this.colorBarElements.push(tick)
      this.group.add(tick)

      // 标签
      const label = new Text({
        style: {
          text: value.toFixed(0),
          x: x,
          y: rect.y + rect.height + 6,
          fontSize: textStyle.fontSize,
          fill: textStyle.color,
          align: "center",
          verticalAlign: "top"
        },
        zlevel: zlevel ?? 0,
        z: (z ?? 10) + 1,
        silent: true
      })
      this.colorBarElements.push(label)
      this.group.add(label)
    }
  }

  /**
   * 渲染单位标签
   */
  private renderUnit(
    rect: { x: number; y: number; width: number; height: number },
    orient: "vertical" | "horizontal",
    unit: { text: string; color: string; fontSize: number },
    zlevel?: number,
    z?: number
  ): void {
    let x: number, y: number
    let align: "left" | "center" | "right" = "center"
    let verticalAlign: "top" | "middle" | "bottom" = "bottom"

    if (orient === "vertical") {
      x = rect.x + rect.width / 2
      y = rect.y - 8
      align = "center"
      verticalAlign = "bottom"
    } else {
      x = rect.x + rect.width + 10
      y = rect.y + rect.height / 2
      align = "left"
      verticalAlign = "middle"
    }

    const unitLabel = new Text({
      style: {
        text: unit.text,
        x,
        y,
        fontSize: unit.fontSize,
        fill: unit.color,
        align,
        verticalAlign
      },
      zlevel: zlevel ?? 0,
      z: (z ?? 10) + 1,
      silent: true
    })
    this.colorBarElements.push(unitLabel)
    this.group.add(unitLabel)
  }

  /**
   * 创建色卡渐变 Canvas
   */
  private createColorBarCanvas(
    colorMap: ColorMapType,
    valueRange: [number, number],
    width: number,
    height: number,
    orient: "vertical" | "horizontal"
  ): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (!ctx) return canvas

    const colorScale = createColorScale(valueRange, colorMap)
    const [minVal, maxVal] = valueRange

    if (orient === "vertical") {
      // 垂直方向：从上到下绘制渐变（上面是最大值，下面是最小值）
      for (let y = 0; y < height; y++) {
        const ratio = 1 - y / height // 从上到下，ratio 从 1 到 0
        const value = minVal + (maxVal - minVal) * ratio
        const color = colorScale(value)

        ctx.fillStyle = color
        ctx.fillRect(0, y, width, 1)
      }
    } else {
      // 水平方向：从左到右绘制渐变（左边是最小值，右边是最大值）
      for (let x = 0; x < width; x++) {
        const ratio = x / width // 从左到右，ratio 从 0 到 1
        const value = minVal + (maxVal - minVal) * ratio
        const color = colorScale(value)

        ctx.fillStyle = color
        ctx.fillRect(x, 0, 1, height)
      }
    }

    return canvas
  }

  /**
   * 清除色卡元素
   */
  private clearColorBar(): void {
    this.colorBarElements.forEach(el => {
      this.group.remove(el)
    })
    this.colorBarElements = []
    this.lastColorBarKey = ""
  }

  /**
   * 清除渲染内容
   */
  public clear(): void {
    this.clearColorBar()
    this.group.removeAll()
  }

  /**
   * 销毁视图
   */
  public destroy(): void {
    super.destroy()
    this.colorBarElements = []
  }
}

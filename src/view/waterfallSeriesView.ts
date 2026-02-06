/**
 * Waterfall Series View - 瀑布图渲染
 *
 * 渲染策略：
 * - 使用离屏 Canvas 绘制热力图
 * - 直接将 Canvas 元素作为 ZRender Image 的图像源（避免 toDataURL 的性能问题）
 * - 支持多种颜色映射方案
 * - 色卡渲染已移至独立的 VisualMapComponent（解耦）
 */

import { Image as ZImage, Rect } from "zrender"
import type { ZRenderType } from "zrender"
import type { WaterfallSeriesRenderItem } from "@/types"
import type { GridRect } from "@/model/GridModel"
import { ComponentView } from "./baseView"
import { createColorScale, type ColorMapType } from "@/utils/scale"

/**
 * WaterfallSeriesView - 负责绘制瀑布图（不包含色卡）
 */
export class WaterfallSeriesView extends ComponentView<WaterfallSeriesRenderItem[]> {
  /** 每个 series 的离屏 Canvas */
  private canvasPool: Map<string, HTMLCanvasElement> = new Map()

  /** ZRender Image 对象池 */
  private imagePool: ZImage[] = []

  constructor(zr: ZRenderType) {
    super(zr)
  }

  /**
   * 获取或创建离屏 Canvas
   */
  private getOrCreateCanvas(key: string, width: number, height: number): HTMLCanvasElement {
    let canvas = this.canvasPool.get(key)

    if (!canvas) {
      canvas = document.createElement("canvas")
      this.canvasPool.set(key, canvas)
    }

    // 只在尺寸变化时调整（避免清空内容）
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    return canvas
  }

  /**
   * 渲染瀑布图
   */
  public render(items: WaterfallSeriesRenderItem[]): void {
    const visibleItems = items.filter(item => item.show && item.matrix.length > 0)
    const needed = visibleItems.length
    const poolSize = this.imagePool.length

    visibleItems.forEach((item, i) => {
      const key = item.id ?? `waterfall-${i}`

      // 绘制热力图到离屏 Canvas
      const canvas = this.renderToCanvas(key, item)

      if (i < poolSize) {
        // 复用已有 Image
        const image = this.imagePool[i]
        image.setStyle({
          image: canvas,
          x: item.rect.x,
          y: item.rect.y,
          width: item.rect.width,
          height: item.rect.height
        })
        image.zlevel = item.zlevel ?? 0
        image.z = item.z ?? 0
        image.show()
      } else {
        // 创建新 Image
        const image = new ZImage({
          style: {
            image: canvas,
            x: item.rect.x,
            y: item.rect.y,
            width: item.rect.width,
            height: item.rect.height
          },
          zlevel: item.zlevel ?? 0,
          z: item.z ?? 0,
          silent: true
        })
        this.imagePool.push(image)
        this.group.add(image)
      }
    })

    // 隐藏多余的 Image
    for (let i = needed; i < poolSize; i++) {
      this.imagePool[i].hide()
    }
  }

  /**
   * 将数据矩阵渲染到 Canvas
   */
  private renderToCanvas(key: string, item: WaterfallSeriesRenderItem): HTMLCanvasElement {
    const { matrix, colorMap, valueRange } = item
    const rows = matrix.length
    const cols = matrix[0]?.length ?? 0

    // 使用数据尺寸作为 Canvas 尺寸
    const canvas = this.getOrCreateCanvas(key, cols, rows)
    const ctx = canvas.getContext("2d")

    if (!ctx || rows === 0 || cols === 0) {
      return canvas
    }

    // 创建颜色比例尺
    const colorScale = createColorScale(valueRange, colorMap as ColorMapType)

    // 创建 ImageData 用于高效像素操作
    const imageData = ctx.createImageData(cols, rows)
    const data = imageData.data

    // 逐像素填充颜色
    for (let row = 0; row < rows; row++) {
      const rowData = matrix[row]
      for (let col = 0; col < cols; col++) {
        const value = rowData[col] ?? 0
        const color = colorScale(value)

        // 解析颜色字符串
        const rgba = this.parseColor(color)

        const pixelIndex = (row * cols + col) * 4
        data[pixelIndex] = rgba.r
        data[pixelIndex + 1] = rgba.g
        data[pixelIndex + 2] = rgba.b
        data[pixelIndex + 3] = 255
      }
    }

    ctx.putImageData(imageData, 0, 0)

    return canvas
  }

  /**
   * 解析颜色字符串为 RGBA
   */
  private parseColor(color: string): { r: number; g: number; b: number; a: number } {
    // D3 返回的颜色格式：rgb(r, g, b) 或 rgba(r, g, b, a)
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10),
        a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
      }
    }

    // 处理 hex 格式
    if (color.startsWith("#")) {
      const hex = color.slice(1)
      if (hex.length === 6) {
        return {
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16),
          a: 1
        }
      }
    }

    // 默认返回黑色
    return { r: 0, g: 0, b: 0, a: 1 }
  }

  /**
   * 设置裁剪区域（不再需要为色卡预留空间）
   */
  public setClipRect(rect: GridRect): void {
    this.group.setClipPath(
      new Rect({
        shape: rect
      })
    )
  }

  /**
   * 清除渲染内容
   */
  public clear(): void {
    this.imagePool = []
    this.canvasPool.clear()
    this.group.removeAll()
  }

  /**
   * 销毁视图
   */
  public destroy(): void {
    super.destroy()
    this.canvasPool.clear()
  }
}

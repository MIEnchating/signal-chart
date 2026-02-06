/**
 * Waterfall Series Component - 瀑布图组件
 *
 * 特点：
 * - 高性能数据推送（pushData 直接追加到 RingBuffer）
 * - 自动颜色映射
 * - 支持滚动方向配置
 */

import type { ComponentContext, WaterfallSeriesRenderItem } from "@/types"
import { ComponentType } from "@/types"
import { BaseComponent } from "./BaseComponent"
import { WaterfallSeriesModel } from "@/model/WaterfallSeriesModel"
import { WaterfallSeriesView } from "@/view/waterfallSeriesView"
import type { GridComponent } from "./GridComponent"
import { Inject } from "@/core/decorators"

export class WaterfallSeriesComponent extends BaseComponent {
  type = ComponentType.WaterfallSeries

  private model: WaterfallSeriesModel
  private view: WaterfallSeriesView

  // 使用装饰器自动注入依赖
  @Inject(ComponentType.Grid)
  private gridComponent!: GridComponent

  constructor(context: ComponentContext) {
    super(context)

    this.model = new WaterfallSeriesModel({
      containerWidth: this.chart.getWidth(),
      containerHeight: this.chart.getHeight()
    })
    this.view = new WaterfallSeriesView(this.chart.getZr())
  }

  init(): void {
    this.view.init()
  }

  /**
   * 高性能数据推送（追加新帧）
   *
   * @param seriesId series 的 id、name 或索引
   * @param frameData 新的一帧频谱数据
   * @returns 是否成功追加
   *
   * @example
   * // 每次收到新的频谱数据时调用
   * chart.pushWaterfallData('waterfall-1', newSpectrumFrame)
   */
  public pushData(seriesId: string | number, frameData: number[]): boolean {
    const key = this.model.findSeriesKey(seriesId)
    if (key === null) return false

    const updated = this.model.pushData(key, frameData)
    if (updated) {
      this.render()
    }
    return updated
  }

  /**
   * 批量推送数据（多帧）
   */
  public pushDataBatch(seriesId: string | number, frames: number[][]): boolean {
    const key = this.model.findSeriesKey(seriesId)
    if (key === null) return false

    const updated = this.model.pushDataBatch(key, frames)
    if (updated) {
      this.render()
    }
    return updated
  }

  /**
   * 清空指定 series 的数据
   */
  public clearData(seriesId: string | number): boolean {
    const key = this.model.findSeriesKey(seriesId)
    if (key === null) return false

    const cleared = this.model.clearData(key)
    if (cleared) {
      this.render()
    }
    return cleared
  }

  /**
   * 统一数据推送（追加到所有 waterfall series）
   * @param frameData 一帧频谱数据
   */
  public pushDataAll(frameData: number[]): void {
    this.model.pushDataAll(frameData)
    this.render()
  }

  update(_data?: any): void {
    if (!this.dirty) {
      return
    }
    this.render()
    this.dirty = false
  }

  /**
   * 执行实际渲染
   */
  private render(): void {
    // 获取 Grid 组件用于定位
    if (!this.gridComponent) {
      return
    }

    const seriesList = this.model.getSeries()
    if (seriesList.length === 0) {
      this.view.render([])
      return
    }

    const renderItems: WaterfallSeriesRenderItem[] = seriesList.map(series => {
      // 根据 xAxisIndex 获取对应的 gridIndex（通过查找 xAxis 配置）
      const option = this.globalModel.getOption()
      const xAxisConfig = option.xAxis[series.xAxisIndex] || option.xAxis[0]
      const gridIndex = xAxisConfig?.gridIndex ?? 0

      // 获取对应 Grid 的渲染区域
      const gridRect = this.gridComponent!.getGridRect(gridIndex)

      // 根据滚动方向处理矩阵
      let matrix = series.matrix

      // 如果是从上往下滚动，反转矩阵（新数据在底部）
      if (series.scrollDirection === "down") {
        matrix = [...matrix].reverse()
      }

      return {
        id: series.id,
        name: series.name,
        show: series.show,
        matrix,
        colorMap: series.colorMap,
        valueRange: series.valueRange,
        rect: {
          x: gridRect.x,
          y: gridRect.y,
          width: gridRect.width,
          height: gridRect.height
        },
        zlevel: series.zlevel,
        z: series.z
      }
    })

    // 设置裁剪区域（使用第一个 series 的 grid）
    if (renderItems.length > 0) {
      const firstRect = renderItems[0].rect
      this.view.setClipRect(firstRect)
    }

    this.view.render(renderItems)
  }

  clear(): void {
    this.view.clear()
  }

  destroy(): void {
    this.view.destroy()
  }

  protected getModel(): WaterfallSeriesModel {
    return this.model
  }
}

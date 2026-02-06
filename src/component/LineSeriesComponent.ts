/**
 * Line Series Component - 基础折线图
 */

import type { ComponentContext } from "@/types"
import { ComponentType } from "@/types"
import { BaseComponent } from "./BaseComponent"
import { LineSeriesModel } from "@/model/LineSeriesModel"
import { LineSeriesView } from "@/view/lineSeriesView"
import { batchLinearMap } from "@/utils/scale"
import type { GridComponent } from "./GridComponent"
import { Inject } from "@/core/decorators"

export class LineSeriesComponent extends BaseComponent {
  type = ComponentType.LineSeries

  private model: LineSeriesModel
  private view: LineSeriesView

  // 使用装饰器自动注入依赖
  @Inject(ComponentType.Grid)
  private gridComponent!: GridComponent

  constructor(context: ComponentContext) {
    super(context)

    this.model = new LineSeriesModel({
      containerWidth: this.chart.getWidth(),
      containerHeight: this.chart.getHeight()
    })
    this.view = new LineSeriesView(this.chart.getZr())
  }

  init(): void {
    this.view.init()
  }

  /**
   * 统一数据更新（替换所有 line series 的数据）
   * @param data 一帧频谱数据
   */
  public setDataAll(data: number[]): void {
    this.model.setAllSeriesData(data)
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
   * 执行实际渲染（内部方法）
   * 使用批量坐标转换优化，避免逐点调用 convertToPixel
   */
  private render(): void {
    // 更新裁剪区域（基于 Grid 区域）
    if (this.gridComponent) {
      const gridRect = this.gridComponent.getGridRect(0)
      this.view.setClipRect(gridRect)
    }

    const seriesList = this.model.getSeries()
    if (seriesList.length === 0) {
      this.view.render([])
      return
    }

    const renderItems = seriesList.map(series => {
      const lineStyle = {
        color: series.lineStyle?.color ?? "#4fd1c5",
        width: series.lineStyle?.width ?? 2
      }

      const finder = { xAxisIndex: series.xAxisIndex, yAxisIndex: series.yAxisIndex }
      const transform = this.chart.getAxisTransform(finder)

      // 提取 x/y 数据值
      const dataLen = series.data.length
      const xValues = new Array<number>(dataLen)
      const yValues = new Array<number>(dataLen)

      for (let i = 0; i < dataLen; i++) {
        const item = series.data[i]
        if (Array.isArray(item)) {
          xValues[i] = item[0]
          yValues[i] = item[1]
        } else {
          xValues[i] = i
          yValues[i] = item
        }
      }

      // 批量坐标转换
      const xPixels = transform.x ? batchLinearMap(xValues, transform.x.domain, transform.x.pixelRange) : xValues
      const yPixels = transform.y ? batchLinearMap(yValues, transform.y.domain, transform.y.pixelRange) : yValues

      // 组合成点数组，过滤无效值
      const points: [number, number][] = []
      for (let i = 0; i < dataLen; i++) {
        const x = xPixels[i]
        const y = yPixels[i]
        if (Number.isFinite(x) && Number.isFinite(y)) {
          points.push([x, y])
        }
      }

      return {
        id: series.id,
        name: series.name,
        show: series.show ?? true,
        points,
        lineStyle,
        smooth: series.smooth ?? false,
        zlevel: series.zlevel,
        z: series.z
      }
    })

    this.view.render(renderItems)
  }

  clear(): void {
    this.view.clear()
  }

  destroy(): void {
    this.view.destroy()
  }

  protected getModel(): LineSeriesModel {
    return this.model
  }
}

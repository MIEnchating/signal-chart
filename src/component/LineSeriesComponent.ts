/**
 * Line Series Component - 基础折线图
 */

import type { ComponentContext } from "@/types"
import { ComponentType } from "@/types"
import { BaseComponent } from "./BaseComponent"
import { LineSeriesModel } from "@/model/LineSeriesModel"
import { LineSeriesView } from "@/view/lineSeriesView"

export class LineSeriesComponent extends BaseComponent {
  type = ComponentType.LineSeries

  static dependencies = [ComponentType.Grid, ComponentType.XAxis, ComponentType.YAxis]

  private model: LineSeriesModel
  private view: LineSeriesView

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

  update(_data?: any): void {
    if (!this.dirty) {
      return
    }

    const seriesList = this.model.getSeries()
    if (seriesList.length === 0) {
      this.view.render([])
      this.dirty = false
      return
    }

    const renderItems = seriesList.map(series => {
      const lineStyle = {
        color: series.lineStyle?.color ?? "#4fd1c5",
        width: series.lineStyle?.width ?? 2
      }
      const points: [number, number][] = []
      const finder = { xAxisIndex: series.xAxisIndex, yAxisIndex: series.yAxisIndex }

      series.data.forEach((item, index) => {
        let xValue: number
        let yValue: number

        if (Array.isArray(item)) {
          xValue = item[0]
          yValue = item[1]
        } else {
          xValue = index
          yValue = item
        }

        const pixel = this.chart.convertToPixel(finder, [xValue, yValue])
        if (Array.isArray(pixel)) {
          const [x, y] = pixel
          const isInGrid = this.chart.containPixel(finder, [x, y])

          // 使用 chart.containPixel 判断点是否在网格内
          if (Number.isFinite(x) && Number.isFinite(y) && isInGrid) {
            points.push([x, y])
          }
        }
      })

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
    this.dirty = false
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

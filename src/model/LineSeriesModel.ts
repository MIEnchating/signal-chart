/**
 * Line Series Model - 线图数据模型
 */

import { ComponentModel } from "./BaseModel"
import type { ChartOption, LineSeriesOption } from "@/types"

export class LineSeriesModel extends ComponentModel<LineSeriesOption[]> {
  protected extractOption(globalOption: ChartOption): LineSeriesOption[] {
    return (globalOption.series || []).filter(series => series.type === "line") as LineSeriesOption[]
  }

  // shouldUpdate 使用父类的 deepEqual 实现，无需重写

  /**
   * 统一更新所有 series 的数据
   * @param data 一帧频谱数据（一维数组）
   */
  public setAllSeriesData(data: number[]): void {
    if (!this.option) return

    // 更新所有 line series 的数据
    this.option.forEach((series, index) => {
      this.option![index] = {
        ...series,
        data
      }
    })
  }

  /**
   * 获取所有 line series 配置（带默认值）
   */
  public getSeries(): LineSeriesOption[] {
    const list = this.option || []
    return list.map((item, index) => ({
      name: item.name ?? `line-${index}`,
      show: item.show ?? true,
      xAxisIndex: item.xAxisIndex ?? 0,
      yAxisIndex: item.yAxisIndex ?? 0,
      lineStyle: {
        color: item.lineStyle?.color ?? this.getColorByIndex(index),
        width: item.lineStyle?.width ?? 2
      },
      data: item.data || [],
      id: item.id,
      type: "line"
    }))
  }
}

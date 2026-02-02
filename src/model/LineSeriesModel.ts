/**
 * Line Series Model - 线图数据模型
 */

import { ComponentModel } from "./BaseModel"
import type { ChartOption, LineSeriesOption } from "@/types"

export class LineSeriesModel extends ComponentModel<LineSeriesOption[]> {
  protected extractOption(globalOption: ChartOption): LineSeriesOption[] {
    return (globalOption.series || []).filter(series => series.type === "line") as LineSeriesOption[]
  }

  // @ts-ignore
  protected shouldUpdate(newOption: LineSeriesOption[]): boolean {
    // 所有检查都通过，认为没有变化
    return true
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

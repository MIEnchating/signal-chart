/**
 * GlobalModel - 全局配置模型
 *
 * 职责：
 * 1. 保存完整的图表配置（用户配置 + 默认值）
 * 2. 提供配置的统一访问接口
 * 3. 作为所有组件的"单一数据源"
 *
 */

import type { ChartOption, InputChartOption } from "@/types"
import { mergeOptions } from "@/utils/config"
import { normalizeChartOption } from "@/utils/normalize"

export class GlobalModel {
  private _option: ChartOption

  constructor() {
    // 初始化时使用默认配置
    this._option = this.createDefaultOption()
  }

  /**
   * 创建完整的默认配置（统一使用数组格式）
   */
  private createDefaultOption(): ChartOption {
    return {
      backgroundColor: "#000",
      grid: [
        {
          z: 2,
          zlevel: 0,
          top: "10%",
          bottom: "10%",
          left: "10%",
          right: "10%"
        }
      ],
      xAxis: [
        {
          gridIndex: 0,
          z: 0,
          zlevel: 0,
          show: true,
          type: "value",
          min: 0,
          max: 100,
          position: "bottom",
          splitNumber: 5,
          axisLine: {
            show: true,
            color: "#fff"
          },
          axisTick: {
            show: true,
            length: 6,
            color: "#fff",
            splitNumber: 5
          },
          axisLabel: {
            show: true,
            color: "#fff",
            fontSize: 12
          }
        }
      ],
      yAxis: [
        {
          gridIndex: 0,
          z: 0,
          zlevel: 0,
          show: true,
          type: "value",
          min: 0,
          max: 100,
          position: "left",
          splitNumber: 5,
          axisLine: {
            show: true,
            color: "#fff"
          },
          axisTick: {
            show: true,
            length: 6,
            color: "#fff",
            splitNumber: 5
          },
          axisLabel: {
            show: true,
            color: "#fff",
            fontSize: 12
          }
        }
      ],
      series: []
    }
  }

  /**
   * 更新配置（增量更新）
   */
  public mergeOption(option: InputChartOption): void {
    // 1. 先规范化新配置（单个对象 -> 数组）
    const normalizedInput = normalizeChartOption(option as any)

    // 2. 合并配置（数组与数组合并）
    const merged = mergeOptions(this._option, normalizedInput)

    // 3. 最终规范化（确保结果正确）
    this._option = normalizeChartOption(merged)
  }

  /**
   * 获取完整配置
   * 组件直接从这里获取配置，然后提取需要的部分
   */
  public getOption(): ChartOption {
    return this._option
  }
}

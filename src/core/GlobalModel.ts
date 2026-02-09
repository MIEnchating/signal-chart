/**
 * GlobalModel - 全局配置模型
 *
 * 职责：
 * 1. 保存完整的图表配置（用户配置 + 默认值）
 * 2. 提供配置的统一访问接口
 * 3. 作为所有组件的"单一数据源"
 * 4. 分层 diff，返回变更的配置键
 */

import type { ChartOption, InputChartOption } from "@/types"
import { mergeOptions, deepEqual } from "@/utils/config"
import { normalizeChartOption } from "@/utils/normalize"

/** 配置变更类型 */
export type ConfigChangeSet = Set<keyof ChartOption>

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
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: "#333",
              width: 1,
              type: "solid"
            }
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
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: "#333",
              width: 1,
              type: "solid"
            }
          }
        }
      ],
      visualMap: [],
      tooltip: {
        show: true,
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: {
            color: "#fff",
            width: 1,
            type: "dashed"
          }
        },
        backgroundColor: "rgba(50, 50, 50, 0.9)",
        borderColor: "#333",
        borderWidth: 1,
        textStyle: {
          color: "#fff",
          fontSize: 12
        },
        padding: 8
      },
      series: []
    }
  }

  /**
   * 更新配置（增量更新）
   *
   * @returns 变更的配置键集合（用于精准通知组件）
   *
   * 优化策略：
   * 1. 先做顶层 key 的快速比较
   * 2. 只对用户传入的 key 做深度比较
   * 3. 返回变更集合，让 ComponentManager 精准通知
   * 4. 智能填充轴配置：为所有索引的轴提供默认值
   */
  public mergeOption(option: InputChartOption): ConfigChangeSet {
    const changedKeys: ConfigChangeSet = new Set()

    // 规范化用户输入（会自动生成 visualMap）
    const normalizedInput = normalizeChartOption(option as any)

    // 智能填充轴配置：为每个轴索引提供默认值
    this.fillAxisDefaults(normalizedInput)

    // 顶层 key 快速 diff（只比较用户传入的字段）
    const inputKeys = Object.keys(normalizedInput) as Array<keyof ChartOption>

    for (const key of inputKeys) {
      const oldValue = this._option[key]
      const newValue = normalizedInput[key]

      // 跳过 undefined（用户没传的字段）
      if (newValue === undefined) continue

      // 快速比较：引用相同则跳过
      if (oldValue === newValue) continue

      // 深度比较：只对变化的字段做深度比较
      if (!deepEqual(oldValue, newValue)) {
        changedKeys.add(key)
      }
    }

    // 特殊处理：如果 series 变化了，检查 visualMap 是否也需要更新
    // 因为 visualMap 可能是从 series 自动生成的
    if (changedKeys.has('series') && normalizedInput.visualMap) {
      if (!deepEqual(this._option.visualMap, normalizedInput.visualMap)) {
        changedKeys.add('visualMap')
      }
    }

    // 执行合并
    this._option = mergeOptions(this._option, normalizedInput)

    return changedKeys
  }

  /**
   * 智能填充轴配置默认值
   *
   * 策略：
   * - 如果用户提供了多个轴，但某些轴缺少子配置（axisLine、axisTick 等）
   * - 自动从索引 0 的轴配置中复制默认值
   * - 遵循 KISS 原则：简单直观的默认值填充
   */
  private fillAxisDefaults(normalizedInput: ChartOption): void {
    // 获取默认轴配置模板
    const defaultXAxis = this._option.xAxis[0]
    const defaultYAxis = this._option.yAxis[0]

    // 填充 X 轴默认值
    if (normalizedInput.xAxis && normalizedInput.xAxis.length > 0) {
      normalizedInput.xAxis = normalizedInput.xAxis.map((axis, index) => {
        // 深度合并：确保子配置也被正确合并
        return {
          ...defaultXAxis,
          ...axis,
          axisLine: { ...defaultXAxis.axisLine, ...axis.axisLine },
          axisTick: { ...defaultXAxis.axisTick, ...axis.axisTick },
          axisLabel: { ...defaultXAxis.axisLabel, ...axis.axisLabel },
          splitLine: axis.splitLine ? {
            ...defaultXAxis.splitLine,
            ...axis.splitLine,
            lineStyle: { ...defaultXAxis.splitLine.lineStyle, ...axis.splitLine.lineStyle }
          } : defaultXAxis.splitLine,
          unit: axis.unit ? { ...defaultXAxis.unit, ...axis.unit } : defaultXAxis.unit,
          gridIndex: axis.gridIndex ?? index
        }
      })
    }

    // 填充 Y 轴默认值
    if (normalizedInput.yAxis && normalizedInput.yAxis.length > 0) {
      normalizedInput.yAxis = normalizedInput.yAxis.map((axis, index) => {
        // 深度合并：确保子配置也被正确合并
        return {
          ...defaultYAxis,
          ...axis,
          axisLine: { ...defaultYAxis.axisLine, ...axis.axisLine },
          axisTick: { ...defaultYAxis.axisTick, ...axis.axisTick },
          axisLabel: { ...defaultYAxis.axisLabel, ...axis.axisLabel },
          splitLine: axis.splitLine ? {
            ...defaultYAxis.splitLine,
            ...axis.splitLine,
            lineStyle: { ...defaultYAxis.splitLine.lineStyle, ...axis.splitLine.lineStyle }
          } : defaultYAxis.splitLine,
          unit: axis.unit ? { ...defaultYAxis.unit, ...axis.unit } : axis.unit,
          gridIndex: axis.gridIndex ?? index
        }
      })
    }
  }

  /**
   * 获取完整配置
   * 组件直接从这里获取配置，然后提取需要的部分
   */
  public getOption(): ChartOption {
    return this._option
  }
}

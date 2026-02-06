/**
 * Waterfall Series Model - 瀑布图数据模型
 *
 * 特点：
 * - 使用 RingBuffer 管理滚动窗口数据
 * - 支持高频数据推送（setData 直接追加）
 * - 自动计算数值范围（用于颜色映射）
 */

import { ComponentModel } from "./BaseModel"
import type { ChartOption, WaterfallSeriesOption } from "@/types"

/**
 * 环形缓冲区 - 用于管理固定大小的滚动窗口数据
 */
class RingBuffer<T> {
  private buffer: T[] = []
  private maxSize: number

  constructor(maxSize: number) {
    this.maxSize = maxSize
  }

  /**
   * 追加数据，超出 maxSize 时自动丢弃最旧的数据
   */
  push(item: T): void {
    this.buffer.push(item)
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift()
    }
  }

  /**
   * 批量追加数据
   */
  pushMany(items: T[]): void {
    items.forEach(item => this.push(item))
  }

  /**
   * 获取所有数据（按时间顺序，最旧的在前）
   */
  getAll(): T[] {
    return [...this.buffer]
  }

  /**
   * 清空缓冲区
   */
  clear(): void {
    this.buffer = []
  }

  /**
   * 获取当前数据量
   */
  get length(): number {
    return this.buffer.length
  }

  /**
   * 调整最大容量
   */
  resize(newMaxSize: number): void {
    this.maxSize = newMaxSize
    // 如果当前数据超出新容量，丢弃最旧的
    while (this.buffer.length > this.maxSize) {
      this.buffer.shift()
    }
  }
}

/**
 * 瀑布图内部数据结构
 */
interface WaterfallInternalData {
  /** 原始配置 */
  config: WaterfallSeriesOption
  /** 环形缓冲区（存储历史帧数据） */
  ringBuffer: RingBuffer<number[]>
  /** 计算后的数值范围 */
  computedValueRange: [number, number]
}

export class WaterfallSeriesModel extends ComponentModel<WaterfallSeriesOption[]> {
  /** 每个 series 的内部数据管理 */
  private internalData: Map<string | number, WaterfallInternalData> = new Map()

  protected extractOption(globalOption: ChartOption): WaterfallSeriesOption[] {
    return (globalOption.series || []).filter(series => series.type === "waterfall") as WaterfallSeriesOption[]
  }

  /**
   * 更新配置时，同步更新内部数据结构
   */
  public updateOption(globalOption: ChartOption): boolean {
    const hasChanged = super.updateOption(globalOption)

    if (hasChanged && this.option) {
      this.syncInternalData()
    }

    return hasChanged
  }

  /**
   * 同步内部数据结构与配置
   */
  private syncInternalData(): void {
    if (!this.option) return

    // 清理不再存在的 series
    const currentIds = new Set(this.option.map((s, i) => s.id ?? i))
    for (const key of this.internalData.keys()) {
      if (!currentIds.has(key)) {
        this.internalData.delete(key)
      }
    }

    // 更新或创建 series 的内部数据
    this.option.forEach((config, index) => {
      const key = config.id ?? index
      const maxRows = config.maxRows ?? 100

      if (this.internalData.has(key)) {
        // 更新已有的
        const data = this.internalData.get(key)!
        data.config = config
        data.ringBuffer.resize(maxRows)

        // 如果配置中有初始数据，追加到缓冲区
        if (config.data && config.data.length > 0) {
          data.ringBuffer.pushMany(config.data)
          data.computedValueRange = this.computeValueRange(data.ringBuffer.getAll(), config.valueRange)
        }
      } else {
        // 创建新的
        const ringBuffer = new RingBuffer<number[]>(maxRows)

        // 初始化数据
        if (config.data && config.data.length > 0) {
          ringBuffer.pushMany(config.data)
        }

        this.internalData.set(key, {
          config,
          ringBuffer,
          computedValueRange: this.computeValueRange(ringBuffer.getAll(), config.valueRange)
        })
      }
    })
  }

  /**
   * 高性能数据推送（追加新帧）
   *
   * @param seriesId series 的 id 或索引
   * @param frameData 新的一帧数据（一维数组）
   * @returns 是否成功追加
   */
  public pushData(seriesId: string | number, frameData: number[]): boolean {
    const data = this.internalData.get(seriesId)
    if (!data) return false

    data.ringBuffer.push(frameData)

    // 如果是 auto 模式，重新计算数值范围
    if (data.config.valueRange === "auto" || !data.config.valueRange) {
      data.computedValueRange = this.computeValueRange(data.ringBuffer.getAll(), "auto")
    }

    return true
  }

  /**
   * 批量推送数据（多帧）
   */
  public pushDataBatch(seriesId: string | number, frames: number[][]): boolean {
    const data = this.internalData.get(seriesId)
    if (!data) return false

    data.ringBuffer.pushMany(frames)

    if (data.config.valueRange === "auto" || !data.config.valueRange) {
      data.computedValueRange = this.computeValueRange(data.ringBuffer.getAll(), "auto")
    }

    return true
  }

  /**
   * 统一推送数据到所有 waterfall series
   * @param frameData 一帧频谱数据
   */
  public pushDataAll(frameData: number[]): void {
    this.internalData.forEach((data, _key) => {
      data.ringBuffer.push(frameData)

      // 如果是 auto 模式，重新计算数值范围
      if (data.config.valueRange === "auto" || !data.config.valueRange) {
        data.computedValueRange = this.computeValueRange(data.ringBuffer.getAll(), "auto")
      }
    })
  }

  /**
   * 计算数值范围
   */
  private computeValueRange(matrix: number[][], configRange?: [number, number] | "auto"): [number, number] {
    if (configRange && configRange !== "auto") {
      return configRange
    }

    // 自动计算
    if (matrix.length === 0) {
      return [-100, 0] // 默认 dB 范围
    }

    let min = Infinity
    let max = -Infinity

    for (const row of matrix) {
      for (const val of row) {
        if (Number.isFinite(val)) {
          if (val < min) min = val
          if (val > max) max = val
        }
      }
    }

    // 如果没有有效数据，返回默认范围
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return [-100, 0]
    }

    return [min, max]
  }

  /**
   * 获取所有 waterfall series 的渲染数据
   */
  public getSeries(): Array<{
    id?: string
    name?: string
    show: boolean
    matrix: number[][]
    colorMap: "viridis" | "inferno" | "plasma" | "turbo" | "cool" | "warm"
    valueRange: [number, number]
    scrollDirection: "down" | "up"
    xAxisIndex: number
    yAxisIndex: number
    zlevel?: number
    z?: number
  }> {
    const result: Array<{
      id?: string
      name?: string
      show: boolean
      matrix: number[][]
      colorMap: "viridis" | "inferno" | "plasma" | "turbo" | "cool" | "warm"
      valueRange: [number, number]
      scrollDirection: "down" | "up"
      xAxisIndex: number
      yAxisIndex: number
      zlevel?: number
      z?: number
    }> = []

    if (!this.option) return result

    this.option.forEach((config, index) => {
      const key = config.id ?? index
      const data = this.internalData.get(key)

      if (!data) return

      result.push({
        id: config.id,
        name: config.name ?? `waterfall-${index}`,
        show: config.show ?? true,
        matrix: data.ringBuffer.getAll(),
        colorMap: config.colorMap ?? "viridis",
        valueRange: data.computedValueRange,
        scrollDirection: config.scrollDirection ?? "down",
        xAxisIndex: config.xAxisIndex ?? 0,
        yAxisIndex: config.yAxisIndex ?? 0,
        zlevel: config.zlevel,
        z: config.z
      })
    })

    return result
  }

  /**
   * 根据 id 或索引查找 series
   */
  public findSeriesKey(seriesId: string | number): string | number | null {
    if (!this.option) return null

    if (typeof seriesId === "number") {
      return seriesId >= 0 && seriesId < this.option.length ? seriesId : null
    }

    const index = this.option.findIndex(s => s.id === seriesId || s.name === seriesId)
    if (index !== -1) {
      return this.option[index].id ?? index
    }

    return null
  }

  /**
   * 清空指定 series 的数据
   */
  public clearData(seriesId: string | number): boolean {
    const data = this.internalData.get(seriesId)
    if (!data) return false

    data.ringBuffer.clear()
    data.computedValueRange = [-100, 0]
    return true
  }
}

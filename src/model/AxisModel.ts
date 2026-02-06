/**
 * Axis 组件 Model - 计算坐标轴布局
 */

import { ComponentModel } from "./BaseModel"
import type { AxisOption, ChartOption, ModelContext } from "@/types"
import { GridModel, GridRect } from "./GridModel"
import { linearMap } from "@/utils/scale"

export interface AxisTickData {
  value: number
  coord: number
  label: string
}

export interface AxisLayoutData {
  position: "top" | "bottom" | "left" | "right"
  orient: "horizontal" | "vertical"
  axisLine: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
  ticks: AxisTickData[]
  range: [number, number]
}

/**
 * AxisModel - 负责计算坐标轴的刻度、标签、位置等
 */
export class AxisModel extends ComponentModel<AxisOption[]> {
  /** GridModel 引用（由组件注入） */
  private gridModel: GridModel | null = null
  /** 布局缓存（按 axisIndex 索引） */
  private layoutCache: Map<number, AxisLayoutData> = new Map()

  protected extractOption(_globalOption: ChartOption): AxisOption[] {
    // 由子类指定是 xAxis 还是 yAxis
    return undefined as any
  }

  /**
   * 获取指定轴配置
   * @param axisIndex 轴索引，默认 0
   */
  public getAxisOption(axisIndex: number = 0): AxisOption | null {
    if (!this.option || this.option.length === 0) {
      return null
    }
    return this.option[axisIndex] || this.option[0]
  }

  /**
   * 设置关联的 GridModel（由组件在初始化时调用）
   */
  public setGridModel(gridModel: GridModel): void {
    this.gridModel = gridModel
  }

  /**
   * 计算指定轴的布局数据
   * @param axisIndex 轴索引
   * @param gridModel 可选，传入则使用传入的，否则使用内部存储的
   */
  public calculateLayoutFor(axisIndex: number, gridModel?: GridModel): AxisLayoutData {
    const gm = gridModel || this.gridModel
    if (!gm) {
      throw new Error("GridModel not set")
    }

    const axisOption = this.getAxisOption(axisIndex)
    if (!axisOption) {
      throw new Error(`No axis configuration available for index ${axisIndex}`)
    }

    const gridIndex = axisOption.gridIndex || 0
    const gridRect = gm.getRect(gridIndex)
    const { position, min, max } = axisOption

    const isHorizontal = position === "top" || position === "bottom"
    const orient = isHorizontal ? "horizontal" : "vertical"

    const axisLine = this.calculateAxisLine(gridRect, position)
    const range = this.calculateRange(min, max)
    const ticks = this.calculateTicksFor(axisOption, range, gridRect, isHorizontal)

    const layoutData: AxisLayoutData = {
      position,
      orient,
      axisLine,
      ticks,
      range
    }

    // 缓存计算结果
    this.layoutCache.set(axisIndex, layoutData)

    return layoutData
  }

  /**
   * 获取布局数据（优先使用缓存）
   * @param axisIndex 轴索引，默认 0
   */
  public getLayoutData(axisIndex: number = 0): AxisLayoutData {
    const cached = this.layoutCache.get(axisIndex)
    if (cached) {
      return cached
    }
    return this.calculateLayoutFor(axisIndex)
  }

  /**
   * 计算轴线的起止坐标
   */
  private calculateAxisLine(
    gridRect: GridRect,
    position: "top" | "bottom" | "left" | "right"
  ): { x1: number; y1: number; x2: number; y2: number } {
    const { x, y, width, height } = gridRect

    switch (position) {
      case "bottom":
        return { x1: x, y1: y + height, x2: x + width, y2: y + height }
      case "top":
        return { x1: x, y1: y, x2: x + width, y2: y }
      case "left":
        return { x1: x, y1: y, x2: x, y2: y + height }
      case "right":
        return { x1: x + width, y1: y, x2: x + width, y2: y + height }
    }
  }

  /**
   * 计算数据范围
   */
  private calculateRange(min: number | "dataMin", max: number | "dataMax"): [number, number] {
    const minValue = typeof min === "number" ? min : 0
    const maxValue = typeof max === "number" ? max : 100

    return [minValue, maxValue]
  }

  /**
   * 计算刻度数据
   */
  private calculateTicksFor(
    axisOption: AxisOption,
    range: [number, number],
    gridRect: GridRect,
    isHorizontal: boolean
  ): AxisTickData[] {
    const [min, max] = range
    const splitNumber = axisOption.splitNumber || 5

    const step = splitNumber > 0 ? (max - min) / splitNumber : 0
    const tickValues: number[] = []
    for (let i = 0; i <= splitNumber; i += 1) {
      tickValues.push(min + step * i)
    }

    const pixelRange = isHorizontal
      ? [gridRect.x, gridRect.x + gridRect.width]
      : [gridRect.y + gridRect.height, gridRect.y]

    const filtered = tickValues.filter(value => value >= min && value <= max)

    if (!filtered.includes(min)) {
      filtered.unshift(min)
    }

    if (!filtered.includes(max)) {
      filtered.push(max)
    }

    const uniqueSorted = Array.from(new Set(filtered)).sort((a, b) => a - b)

    return uniqueSorted.map(value => ({
      value,
      coord: linearMap(value, range, pixelRange as [number, number]),
      label: this.formatLabel(value)
    }))
  }

  /**
   * 格式化刻度标签
   */
  private formatLabel(value: number): string {
    if (Math.abs(value) >= 1000) {
      return value.toExponential(1)
    }
    const decimals = value % 1 === 0 ? 0 : 2
    return value.toFixed(decimals)
  }

  /**
   * 更新选项时清除缓存
   */
  public updateOption(globalOption: ChartOption): boolean {
    const hasChanged = super.updateOption(globalOption)
    if (hasChanged) {
      this.layoutCache.clear()
    }
    return hasChanged
  }

  /**
   * 容器尺寸变化时清除布局缓存
   */
  public updateContext(context: Partial<ModelContext>): boolean {
    const hasChanged = super.updateContext(context)
    this.layoutCache.clear()
    return hasChanged
  }
}

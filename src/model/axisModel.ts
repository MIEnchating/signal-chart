/**
 * Axis 组件 Model - 计算坐标轴布局
 */

import { ComponentModel } from "./baseModel"
import { AxisOption, ChartOption } from "@/core/type"
import { GridModel, GridRect } from "./gridModel"
import { linearMap } from "@/utils/coordinate"
import { calculateNiceTicks } from "@/utils/format"

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
export class AxisModel extends ComponentModel<AxisOption> {
  private gridModel: GridModel | null = null
  private layoutData: AxisLayoutData | null = null

  protected getDefaultOption(): AxisOption {
    return {
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
  }

  protected extractOption(_globalOption: ChartOption): AxisOption | undefined {
    // 由子类指定是 xAxis 还是 yAxis
    return undefined
  }

  /**
   * 设置关联的 GridModel
   */
  public setGridModel(gridModel: GridModel): void {
    this.gridModel = gridModel
    this.dirty = true
  }

  /**
   * 计算坐标轴布局数据
   */
  public calculateLayout(): AxisLayoutData {
    if (!this.gridModel) {
      throw new Error("GridModel not set")
    }

    const gridRect = this.gridModel.getRect()
    const { position, min, max } = this.option

    // 确定方向
    const isHorizontal = position === "top" || position === "bottom"
    const orient = isHorizontal ? "horizontal" : "vertical"

    // 计算轴线位置
    const axisLine = this.calculateAxisLine(gridRect, position)

    // 计算数据范围
    const range = this.calculateRange(min, max)

    // 计算刻度
    const ticks = this.calculateTicks(range, gridRect, isHorizontal)

    this.layoutData = {
      position,
      orient,
      axisLine,
      ticks,
      range
    }

    return this.layoutData
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
    // TODO: 处理 'dataMin' 和 'dataMax'，需要从 series 获取实际数据范围
    const minValue = typeof min === "number" ? min : 0
    const maxValue = typeof max === "number" ? max : 100

    return [minValue, maxValue]
  }

  /**
   * 计算刻度数据
   */
  private calculateTicks(range: [number, number], gridRect: GridRect, isHorizontal: boolean): AxisTickData[] {
    const [min, max] = range
    const { splitNumber } = this.option

    // 使用 Nice Numbers 算法计算刻度值
    const tickValues = calculateNiceTicks(min, max, splitNumber)

    // 计算每个刻度的像素坐标
    const pixelRange = isHorizontal
      ? [gridRect.x, gridRect.x + gridRect.width]
      : [gridRect.y + gridRect.height, gridRect.y] // Y 轴是反的

    return tickValues.map(value => ({
      value,
      coord: linearMap(value, range, pixelRange as [number, number]),
      label: this.formatLabel(value)
    }))
  }

  /**
   * 格式化刻度标签
   */
  private formatLabel(value: number): string {
    // 简单格式化，可以根据需要扩展
    if (Math.abs(value) >= 1000) {
      return value.toExponential(1)
    }

    // 保留合适的小数位数
    const decimals = value % 1 === 0 ? 0 : 2
    return value.toFixed(decimals)
  }

  /**
   * 数据坐标转像素坐标
   */
  public dataToCoord(dataValue: number): number {
    if (!this.layoutData) {
      this.calculateLayout()
    }

    const { range, position } = this.layoutData!
    const gridRect = this.gridModel!.getRect()

    const isHorizontal = position === "top" || position === "bottom"
    const pixelRange = isHorizontal
      ? [gridRect.x, gridRect.x + gridRect.width]
      : [gridRect.y + gridRect.height, gridRect.y]

    return linearMap(dataValue, range, pixelRange as [number, number])
  }

  /**
   * 像素坐标转数据坐标
   */
  public coordToData(coord: number): number {
    if (!this.layoutData) {
      this.calculateLayout()
    }

    const { range, position } = this.layoutData!
    const gridRect = this.gridModel!.getRect()

    const isHorizontal = position === "top" || position === "bottom"
    const pixelRange = isHorizontal
      ? [gridRect.x, gridRect.x + gridRect.width]
      : [gridRect.y + gridRect.height, gridRect.y]

    return linearMap(coord, pixelRange as [number, number], range)
  }

  /**
   * 获取布局数据
   */
  public getLayoutData(): AxisLayoutData {
    if (!this.layoutData) {
      return this.calculateLayout()
    }
    return this.layoutData
  }

  /**
   * 更新选项时重新计算
   */
  public updateOption(globalOption: ChartOption): void {
    super.updateOption(globalOption)
    if (this.dirty && this.gridModel) {
      this.calculateLayout()
    }
  }
}

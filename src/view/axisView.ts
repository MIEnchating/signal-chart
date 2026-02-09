/**
 * Axis 组件 View - 渲染坐标轴
 */

import { ComponentView } from "./baseView"
import { AxisModel, AxisLayoutData, AxisTickData } from "@/model/AxisModel"
import { GridModel } from "@/model/GridModel"
import type { AxisOption } from "@/types"
import { Line, Text } from "zrender"

type AxisPosition = "top" | "bottom" | "left" | "right"

/**
 * AxisView - 负责绘制坐标轴（轴线、刻度、标签、分割线）
 */
export class AxisView extends ComponentView<AxisModel> {
  private gridModel: GridModel | null = null

  /**
   * 设置 GridModel（用于渲染分割线）
   */
  public setGridModel(gridModel: GridModel): void {
    this.gridModel = gridModel
  }

  /**
   * 根据 AxisModel 渲染坐标轴
   */
  public render(model: AxisModel): void {
    this.clear()

    const option = model.getAxisOption(0)
    if (!option || !option.show) {
      return
    }

    const layoutData = model.getLayoutData(0)

    // 调试日志
    console.log('[AxisView] render:', {
      show: option.show,
      axisLine: option.axisLine,
      axisTick: option.axisTick,
      axisLabel: option.axisLabel,
      splitLine: option.splitLine,
      layoutData
    })

    // 渲染分割线（在最底层）
    if (option.splitLine.show) {
      this.renderSplitLines(layoutData, option)
    }

    // 渲染轴线
    if (option.axisLine.show) {
      this.renderAxisLine(layoutData, option)
    }

    // 渲染刻度和标签
    if (option.axisTick.show || option.axisLabel.show) {
      this.renderTicksAndLabels(layoutData, option)
    }

    // 渲染单位
    if (option.unit?.show) {
      this.renderUnit(layoutData, option)
    }
  }

  /**
   * 渲染分割线
   */
  private renderSplitLines(layoutData: AxisLayoutData, option: AxisOption): void {
    const { ticks, position } = layoutData
    const { splitLine } = option
    const isHorizontal = position === "top" || position === "bottom"

    // 检查 GridModel 是否可用
    if (!this.gridModel) {
      console.warn('[AxisView] GridModel not available for split lines')
      return
    }

    const gridIndex = option.gridIndex || 0
    const gridRect = this.gridModel.getRect(gridIndex)

    // 只为主刻度渲染分割线
    ticks.forEach(tick => {
      if (tick.isMajor === false) return // 跳过小刻度

      let x1: number, y1: number, x2: number, y2: number

      if (isHorizontal) {
        // X 轴：分割线是垂直的
        x1 = x2 = tick.coord
        y1 = gridRect.y
        y2 = gridRect.y + gridRect.height
      } else {
        // Y 轴：分割线是水平的
        y1 = y2 = tick.coord
        x1 = gridRect.x
        x2 = gridRect.x + gridRect.width
      }

      const splitLineShape = new Line({
        shape: { x1, y1, x2, y2 },
        style: {
          stroke: splitLine.lineStyle.color,
          lineWidth: splitLine.lineStyle.width,
          lineDash: splitLine.lineStyle.type === "dashed" ? [5, 5] :
                    splitLine.lineStyle.type === "dotted" ? [2, 2] : undefined
        },
        zlevel: option.zlevel ?? 0,
        z: (option.z ?? 0) - 1, // 分割线在轴线下方
        silent: true
      })

      this.group.add(splitLineShape)
    })
  }

  /**
   * 渲染轴线
   */
  private renderAxisLine(layoutData: AxisLayoutData, option: AxisOption): void {
    const { axisLine } = layoutData

    const line = new Line({
      shape: {
        x1: axisLine.x1,
        y1: axisLine.y1,
        x2: axisLine.x2,
        y2: axisLine.y2
      },
      style: {
        stroke: option.axisLine.color,
        lineWidth: 1
      },
      silent: true,
      zlevel: option.zlevel ?? 0,
      z: option.z ?? 0
    })

    this.group.add(line)
  }

  /**
   * 渲染刻度和标签
   */
  private renderTicksAndLabels(layoutData: AxisLayoutData, option: AxisOption): void {
    const { ticks, position } = layoutData
    const isHorizontal = position === "top" || position === "bottom"

    ticks.forEach(tick => {
      // 渲染刻度线
      if (option.axisTick.show) {
        this.renderTick(tick, position, isHorizontal, option, layoutData)
      }

      // 渲染标签（只为主刻度渲染标签）
      if (option.axisLabel.show && tick.label) {
        this.renderLabel(tick, position, isHorizontal, option, layoutData)
      }
    })
  }

  /**
   * 渲染单个刻度线
   */
  private renderTick(
    tick: AxisTickData,
    position: AxisPosition,
    isHorizontal: boolean,
    option: AxisOption,
    layoutData: AxisLayoutData
  ): void {
    const { axisTick } = option
    // 主刻度使用完整长度，小刻度使用一半长度
    const length = tick.isMajor !== false ? axisTick.length : axisTick.length / 2

    let x1: number, y1: number, x2: number, y2: number

    if (isHorizontal) {
      x1 = x2 = tick.coord
      if (position === "bottom") {
        y1 = layoutData.axisLine.y1
        y2 = y1 + length
      } else {
        y1 = layoutData.axisLine.y1
        y2 = y1 - length
      }
    } else {
      y1 = y2 = tick.coord
      if (position === "left") {
        x1 = layoutData.axisLine.x1
        x2 = x1 - length
      } else {
        x1 = layoutData.axisLine.x1
        x2 = x1 + length
      }
    }

    // 调试日志
    console.log('[AxisView] renderTick:', {
      position,
      tick: tick.value,
      isMajor: tick.isMajor,
      length,
      coords: { x1, y1, x2, y2 },
      color: axisTick.color
    })

    const tickLine = new Line({
      shape: { x1, y1, x2, y2 },
      style: {
        stroke: axisTick.color,
        lineWidth: 1
      },
      zlevel: option.zlevel ?? 0,
      z: option.z ?? 0,
      silent: true
    })

    this.group.add(tickLine)
  }

  /**
   * 渲染刻度标签
   */
  private renderLabel(
    tick: AxisTickData,
    position: AxisPosition,
    isHorizontal: boolean,
    option: AxisOption,
    layoutData: AxisLayoutData
  ): void {
    const { axisLabel } = option
    const gap = 8 // 标签与轴线的间距

    let x: number, y: number
    let textAlign: "left" | "center" | "right" = "center"
    let textVerticalAlign: "top" | "middle" | "bottom" = "middle"

    if (isHorizontal) {
      x = tick.coord
      if (position === "bottom") {
        y = layoutData.axisLine.y1 + option.axisTick.length + gap
        textVerticalAlign = "top"
      } else {
        y = layoutData.axisLine.y1 - option.axisTick.length - gap
        textVerticalAlign = "bottom"
      }
      textAlign = "center"
    } else {
      y = tick.coord
      if (position === "left") {
        x = layoutData.axisLine.x1 - option.axisTick.length - gap
        textAlign = "right"
      } else {
        x = layoutData.axisLine.x1 + option.axisTick.length + gap
        textAlign = "left"
      }
      textVerticalAlign = "middle"
    }

    const text = new Text({
      style: {
        text: tick.label,
        x,
        y,
        fill: axisLabel.color,
        fontSize: axisLabel.fontSize,
        align: textAlign,
        verticalAlign: textVerticalAlign
      },
      silent: true,
      zlevel: option.zlevel ?? 0,
      z: option.z ?? 0
    })

    this.group.add(text)
  }

  /**
   * 渲染单位文本
   */
  private renderUnit(layoutData: AxisLayoutData, option: AxisOption): void {
    const { unit } = option
    if (!unit) return

    const { axisLine, position } = layoutData

    let x: number, y: number
    let align: "left" | "center" | "right" = "center"

    if (position === "bottom" || position === "top") {
      x = axisLine.x2 + 10
      y = axisLine.y2
      align = "left"
    } else {
      x = axisLine.x1
      y = axisLine.y1 - 10
      align = "center"
    }

    const unitText = new Text({
      style: {
        text: unit.text,
        x,
        y,
        fill: unit.color,
        fontSize: unit.fontSize,
        align,
        verticalAlign: "bottom"
      },
      silent: true,
      zlevel: option.zlevel ?? 0,
      z: option.z ?? 0
    })

    this.group.add(unitText)
  }
}

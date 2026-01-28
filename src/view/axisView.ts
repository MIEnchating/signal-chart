/**
 * Axis 组件 View - 渲染坐标轴
 */

import { ComponentView } from "./baseView"
import { AxisModel } from "@/model/AxisModel"
import { Line, Text } from "zrender"

/**
 * AxisView - 负责绘制坐标轴（轴线、刻度、标签）
 */
export class AxisView extends ComponentView<AxisModel> {
  /**
   * 根据 AxisModel 渲染坐标轴
   */
  public render(model: AxisModel): void {
    this.clear()

    // 获取当前轴的配置（不是数组）
    const option = model.getCurrentAxisOption()
    if (!option || !option.show) {
      return
    }

    const layoutData = model.getLayoutData()

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
   * 渲染轴线
   */
  private renderAxisLine(layoutData: any, option: any): void {
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
  private renderTicksAndLabels(layoutData: any, option: any): void {
    const { ticks, position } = layoutData
    const isHorizontal = position === "top" || position === "bottom"

    ticks.forEach((tick: any) => {
      // 渲染刻度线
      if (option.axisTick.show) {
        this.renderTick(tick, position, isHorizontal, option, layoutData)
      }

      // 渲染标签
      if (option.axisLabel.show) {
        this.renderLabel(tick, position, isHorizontal, option, layoutData)
      }
    })
  }

  /**
   * 渲染单个刻度线
   */
  private renderTick(tick: any, position: string, isHorizontal: boolean, option: any, layoutData: any): void {
    const { axisTick } = option
    const length = axisTick.length

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
  private renderLabel(tick: any, position: string, isHorizontal: boolean, option: any, layoutData: any): void {
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
  private renderUnit(layoutData: any, option: any): void {
    const { unit } = option
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

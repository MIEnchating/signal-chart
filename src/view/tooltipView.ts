/**
 * Tooltip 组件 View - 渲染提示框
 */

import { ComponentView } from "./baseView"
import { Rect, Text, Line, Group } from "zrender"
import type { ZRenderType } from "zrender"
import type { TooltipOption, ChartOption } from "@/types"
import { GridModel } from "@/model/GridModel"
import { AxisModel } from "@/model/AxisModel"
import { linearMap } from "@/utils/scale"

/**
 * TooltipView - 负责绘制提示框
 */
export class TooltipView extends ComponentView<null> {
  private option: TooltipOption | null = null
  private tooltipGroup: Group | null = null
  private axisPointerLine: Line | null = null

  // 依赖的 Model
  private gridModel: GridModel | null = null
  private xAxisModel: AxisModel | null = null
  private yAxisModel: AxisModel | null = null

  constructor(zr: ZRenderType) {
    super(zr)
  }

  /**
   * 设置依赖的 Model
   */
  public setDependencies(
    gridModel: GridModel,
    xAxisModel: AxisModel,
    yAxisModel: AxisModel
  ): void {
    this.gridModel = gridModel
    this.xAxisModel = xAxisModel
    this.yAxisModel = yAxisModel
  }

  /**
   * 更新配置
   */
  public updateOption(option: TooltipOption | null): void {
    this.option = option
  }

  /**
   * 显示 Tooltip
   */
  public show(mouseX: number, mouseY: number, chartOption: ChartOption): void {
    if (!this.option || !this.option.show) {
      return
    }

    // 清除旧的 Tooltip
    this.clear()

    // 检查鼠标是否在 Grid 区域内
    if (!this.gridModel) return

    const gridRect = this.gridModel.getRect(0)
    if (
      mouseX < gridRect.x ||
      mouseX > gridRect.x + gridRect.width ||
      mouseY < gridRect.y ||
      mouseY > gridRect.y + gridRect.height
    ) {
      return
    }

    // 根据触发类型显示不同的 Tooltip
    if (this.option.trigger === "axis") {
      this.showAxisTooltip(mouseX, mouseY, chartOption)
    } else if (this.option.trigger === "item") {
      this.showItemTooltip(mouseX, mouseY, chartOption)
    }
  }

  /**
   * 显示轴触发的 Tooltip
   */
  private showAxisTooltip(mouseX: number, mouseY: number, chartOption: ChartOption): void {
    if (!this.gridModel || !this.xAxisModel || !this.yAxisModel) return

    const gridRect = this.gridModel.getRect(0)
    const xAxisOption = this.xAxisModel.getAxisOption(0)
    const yAxisOption = this.yAxisModel.getAxisOption(0)

    if (!xAxisOption || !yAxisOption) return

    // 计算鼠标位置对应的数据值
    const xRange: [number, number] = [xAxisOption.min as number, xAxisOption.max as number]
    const yRange: [number, number] = [yAxisOption.min as number, yAxisOption.max as number]

    const xPixelRange: [number, number] = [gridRect.x, gridRect.x + gridRect.width]
    const yPixelRange: [number, number] = [gridRect.y + gridRect.height, gridRect.y]

    const xValue = linearMap(mouseX, xPixelRange, xRange)
    const yValue = linearMap(mouseY, yPixelRange, yRange)

    // 渲染坐标轴指示器
    if (this.option?.axisPointer && this.option.axisPointer.type !== "none") {
      this.renderAxisPointer(mouseX, mouseY, gridRect)
    }

    // 渲染 Tooltip 内容
    this.renderTooltipContent(mouseX, mouseY, xValue, yValue, chartOption)
  }

  /**
   * 显示数据项触发的 Tooltip
   */
  private showItemTooltip(_mouseX: number, _mouseY: number, _chartOption: ChartOption): void {
    // TODO: 实现 item 触发模式
    // 需要检测鼠标是否悬停在具体的数据点上
  }

  /**
   * 渲染坐标轴指示器
   */
  private renderAxisPointer(
    mouseX: number,
    mouseY: number,
    gridRect: { x: number; y: number; width: number; height: number }
  ): void {
    if (!this.option?.axisPointer) return

    const { type, lineStyle } = this.option.axisPointer

    if (type === "line") {
      // 垂直线
      this.axisPointerLine = new Line({
        shape: {
          x1: mouseX,
          y1: gridRect.y,
          x2: mouseX,
          y2: gridRect.y + gridRect.height
        },
        style: {
          stroke: lineStyle?.color || "#fff",
          lineWidth: lineStyle?.width || 1,
          lineDash: lineStyle?.type === "dashed" ? [5, 5] :
                    lineStyle?.type === "dotted" ? [2, 2] : undefined
        },
        zlevel: 100,
        z: 100,
        silent: true
      })

      this.group.add(this.axisPointerLine)
    } else if (type === "cross") {
      // 十字线
      const vLine = new Line({
        shape: {
          x1: mouseX,
          y1: gridRect.y,
          x2: mouseX,
          y2: gridRect.y + gridRect.height
        },
        style: {
          stroke: lineStyle?.color || "#fff",
          lineWidth: lineStyle?.width || 1,
          lineDash: lineStyle?.type === "dashed" ? [5, 5] : undefined
        },
        zlevel: 100,
        z: 100,
        silent: true
      })

      const hLine = new Line({
        shape: {
          x1: gridRect.x,
          y1: mouseY,
          x2: gridRect.x + gridRect.width,
          y2: mouseY
        },
        style: {
          stroke: lineStyle?.color || "#fff",
          lineWidth: lineStyle?.width || 1,
          lineDash: lineStyle?.type === "dashed" ? [5, 5] : undefined
        },
        zlevel: 100,
        z: 100,
        silent: true
      })

      this.group.add(vLine)
      this.group.add(hLine)
    }
  }

  /**
   * 渲染 Tooltip 内容
   */
  private renderTooltipContent(
    mouseX: number,
    mouseY: number,
    xValue: number,
    yValue: number,
    chartOption: ChartOption
  ): void {
    if (!this.option) return

    // 创建 Tooltip 组
    this.tooltipGroup = new Group()

    // 构建 Tooltip 文本
    const lines: string[] = []

    // 添加坐标信息
    lines.push(`X: ${xValue.toFixed(2)}`)
    lines.push(`Y: ${yValue.toFixed(2)} dB`)

    // 添加 series 信息
    chartOption.series.forEach((series) => {
      if (series.name) {
        lines.push(`${series.name}: ${yValue.toFixed(2)} dB`)
      }
    })

    const text = lines.join('\n')

    // 计算 Tooltip 尺寸
    const fontSize = this.option.textStyle?.fontSize || 12
    const padding = this.option.padding || 8
    const lineHeight = fontSize + 4
    const maxLineWidth = Math.max(...lines.map(line => line.length * fontSize * 0.6))
    const tooltipWidth = maxLineWidth + padding * 2
    const tooltipHeight = lines.length * lineHeight + padding * 2

    // 计算 Tooltip 位置（避免超出容器）
    let tooltipX = mouseX + 10
    let tooltipY = mouseY + 10

    const gridRect = this.gridModel?.getRect(0)
    if (!gridRect) return

    const containerWidth = gridRect.x + gridRect.width
    const containerHeight = gridRect.y + gridRect.height

    if (tooltipX + tooltipWidth > containerWidth) {
      tooltipX = mouseX - tooltipWidth - 10
    }

    if (tooltipY + tooltipHeight > containerHeight) {
      tooltipY = mouseY - tooltipHeight - 10
    }

    // 渲染背景
    const background = new Rect({
      shape: {
        x: tooltipX,
        y: tooltipY,
        width: tooltipWidth,
        height: tooltipHeight,
        r: 4
      },
      style: {
        fill: this.option.backgroundColor || "rgba(50, 50, 50, 0.9)",
        stroke: this.option.borderColor || "#333",
        lineWidth: this.option.borderWidth || 1
      },
      zlevel: 100,
      z: 100,
      silent: true
    })

    this.tooltipGroup.add(background)

    // 渲染文本
    const textElement = new Text({
      style: {
        text,
        x: tooltipX + padding,
        y: tooltipY + padding,
        fill: this.option.textStyle?.color || "#fff",
        fontSize: fontSize,
        lineHeight: lineHeight,
        align: "left",
        verticalAlign: "top"
      },
      zlevel: 100,
      z: 101,
      silent: true
    })

    this.tooltipGroup.add(textElement)

    this.group.add(this.tooltipGroup)
  }

  /**
   * 隐藏 Tooltip
   */
  public hide(): void {
    this.clear()
  }

  /**
   * 清除 Tooltip
   */
  public clear(): void {
    if (this.tooltipGroup) {
      this.group.remove(this.tooltipGroup)
      this.tooltipGroup = null
    }

    if (this.axisPointerLine) {
      this.group.remove(this.axisPointerLine)
      this.axisPointerLine = null
    }

    this.group.removeAll()
  }

  /**
   * 渲染（Tooltip 不需要主动渲染）
   */
  public render(_data: null): void {
    // Tooltip 通过 show/hide 方法控制显示
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.clear()
    super.destroy()
  }
}

/**
 * VisualMapModel - 视觉映射组件模型
 *
 * 职责：
 * - 管理 visualMap 配置
 * - 计算色卡的布局位置
 * - 提供渲染数据
 */

import { ComponentModel } from "./BaseModel"
import type { ChartOption, VisualMapOption, VisualMapRenderItem } from "@/types"
import { parsePercent } from "@/utils/layout"

export class VisualMapModel extends ComponentModel<VisualMapOption[]> {
  protected extractOption(globalOption: ChartOption): VisualMapOption[] {
    return globalOption.visualMap || []
  }

  /**
   * 获取指定 visualMap 的配置
   */
  public getVisualMapOption(index: number = 0): VisualMapOption | null {
    if (!this.option || this.option.length === 0) {
      return null
    }
    return this.option[index] || null
  }

  /**
   * 计算 visualMap 的渲染数据
   */
  public getRenderItem(index: number = 0): VisualMapRenderItem | null {
    const option = this.getVisualMapOption(index)
    if (!option || !option.show) {
      return null
    }

    const { containerWidth, containerHeight } = this.context

    // 计算位置
    const rect = this.calculatePosition(option, containerWidth, containerHeight)

    return {
      id: option.id,
      show: option.show,
      colorMap: option.colorMap,
      valueRange: [option.min, option.max],
      rect,
      orient: option.orient,
      splitNumber: option.splitNumber,
      textStyle: option.textStyle,
      unit: option.unit,
      zlevel: option.zlevel,
      z: option.z
    }
  }

  /**
   * 计算 visualMap 的位置
   */
  private calculatePosition(
    option: VisualMapOption,
    containerWidth: number,
    containerHeight: number
  ): { x: number; y: number; width: number; height: number } {
    const { itemWidth, itemHeight, orient, textStyle, min, max } = option

    // 计算标签所需的额外空间（当 containLabel !== false 时）
    const containLabel = option.containLabel !== false // 默认为 true
    let labelPadding = 0

    if (containLabel) {
      if (orient === "vertical") {
        // 垂直方向：标签在右侧
        // 计算最大值的字符数（包括负号）
        const maxAbsValue = Math.max(Math.abs(min), Math.abs(max))
        const maxChars = maxAbsValue.toFixed(0).length + (min < 0 ? 1 : 0)

        // 预估标签宽度：字符数 * 字体大小 * 0.6（经验系数）
        const fontSize = textStyle?.fontSize || 10
        const labelMaxWidth = maxChars * fontSize * 0.6
        const tickLength = 4
        const gap = 6

        labelPadding = labelMaxWidth + tickLength + gap
      } else {
        // 水平方向：标签在下方
        const fontSize = textStyle?.fontSize || 10
        const tickLength = 4
        const gap = 6

        labelPadding = fontSize + tickLength + gap
      }
    }

    // 默认位置：右侧居中
    let x = containerWidth - itemWidth - 20 - (orient === "vertical" ? labelPadding : 0)
    let y = containerHeight / 2 - itemHeight / 2

    // 处理 left/right
    if (option.left !== undefined) {
      x = typeof option.left === "number" ? option.left : parsePercent(option.left, containerWidth)
    } else if (option.right !== undefined) {
      const rightValue =
        typeof option.right === "number" ? option.right : parsePercent(option.right, containerWidth)
      x = containerWidth - rightValue - itemWidth - (orient === "vertical" ? labelPadding : 0)
    }

    // 处理 top/bottom
    if (option.top !== undefined) {
      y = typeof option.top === "number" ? option.top : parsePercent(option.top, containerHeight)
    } else if (option.bottom !== undefined) {
      const bottomValue =
        typeof option.bottom === "number" ? option.bottom : parsePercent(option.bottom, containerHeight)
      y = containerHeight - bottomValue - itemHeight - (orient === "horizontal" ? labelPadding : 0)
    }

    return {
      x,
      y,
      width: itemWidth,
      height: itemHeight
    }
  }

  /**
   * 获取关联的 series 索引列表
   */
  public getSeriesIndices(index: number = 0): number[] {
    const option = this.getVisualMapOption(index)
    if (!option || option.seriesIndex === undefined) {
      return []
    }

    return Array.isArray(option.seriesIndex) ? option.seriesIndex : [option.seriesIndex]
  }
}

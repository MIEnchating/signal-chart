/**
 * Grid 组件 Model - 计算网格布局
 */

import { ComponentModel } from "./baseModel"
import type { ChartOption, GridOption, ModelContext } from "@/types"
import { calculateRect } from "@/utils/layout"

export interface GridRect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * GridModel - 负责计算 Grid 的像素位置和尺寸
 */
export class GridModel extends ComponentModel<GridOption> {
  private rect: GridRect | null = null

  protected getDefaultOption(): GridOption {
    return {
      top: "10%",
      bottom: "10%",
      left: "10%",
      right: "10%"
    }
  }

  protected extractOption(globalOption: ChartOption): GridOption | undefined {
    return globalOption.grid
  }

  /**
   * 计算 Grid 的实际像素区域
   */
  public calculateRect(): GridRect {
    const { containerWidth, containerHeight } = this.context
    const { top, bottom, left, right } = this.option

    this.rect = calculateRect(containerWidth, containerHeight, top, bottom, left, right)

    return this.rect
  }

  /**
   * 获取 Grid 矩形区域
   */
  public getRect(): GridRect {
    if (!this.rect) {
      return this.calculateRect()
    }
    return this.rect
  }

  /**
   * 当配置或上下文更新时，重新计算
   */
  public updateOption(globalOption: ChartOption): boolean {
    const hasChanged = super.updateOption(globalOption)
    if (hasChanged) {
      this.calculateRect()
    }
    return hasChanged
  }

  public updateContext(context: Partial<ModelContext>): boolean {
    const hasChanged = super.updateContext(context)
    this.calculateRect()
    return hasChanged
  }
}

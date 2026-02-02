/**
 * Grid 组件 Model - 计算网格布局
 */

import { ComponentModel } from "./BaseModel"
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
export class GridModel extends ComponentModel<GridOption[]> {
  private rectCache: Map<number, GridRect> = new Map()
  // 当前处理的 grid 索引
  private gridIndex: number = 0

  protected extractOption(globalOption: ChartOption): GridOption[] | undefined {
    return globalOption.grid || []
  }

  /**
   * 获取当前 grid 配置（默认第一个）
   */
  private getCurrentGrid(): GridOption | null {
    if (!this.option || this.option.length === 0) {
      return null
    }
    return this.option[this.gridIndex] || this.option[0]
  }

  /**
   * 设置要处理的 grid 索引
   */
  public setGridIndex(index: number): void {
    this.gridIndex = index
  }

  /**
   * 计算指定 Grid 的实际像素区域
   */
  public calculateRect(gridIndex: number = this.gridIndex): GridRect {
    const { containerWidth, containerHeight } = this.context

    const currentGrid = this.option?.[gridIndex] || this.getCurrentGrid()
    if (!currentGrid) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
    const { top, bottom, left, right } = currentGrid

    const rect = calculateRect(containerWidth, containerHeight, top, bottom, left, right)
    this.rectCache.set(gridIndex, rect)

    return rect
  }

  /**
   * 获取指定 Grid 矩形区域
   */
  public getRect(gridIndex: number = this.gridIndex): GridRect {
    if (!this.rectCache.has(gridIndex)) {
      return this.calculateRect(gridIndex)
    }
    return this.rectCache.get(gridIndex)!
  }

  /**
   * 当配置或上下文更新时，重新计算
   */
  public updateOption(globalOption: ChartOption): boolean {
    const hasChanged = super.updateOption(globalOption)
    if (hasChanged) {
      // 清除缓存，所有 grid 需要重新计算
      this.rectCache.clear()
    }
    return hasChanged
  }

  public updateContext(context: Partial<ModelContext>): boolean {
    const hasChanged = super.updateContext(context)
    // 清除缓存，所有 grid 需要重新计算
    this.rectCache.clear()
    return hasChanged
  }
}

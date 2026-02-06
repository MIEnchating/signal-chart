import {
  ChartOption,
  ComponentConstructor,
  InputChartOption,
  CoordinateFinder,
  CoordinateTransform,
  AxisTransformParams,
  ComponentType,
  AxisOption
} from "@/types"
import { ComponentManager } from "./ComponentManage"
import { registerPainter, type ZRenderType } from "zrender"
import CanvasPainter from "zrender/lib/canvas/Painter"
import SVGPainter from "zrender/lib/svg/Painter"
import { AxisModel } from "@/model/AxisModel"
import { GridModel } from "@/model/GridModel"
import { linearMap } from "@/utils/scale"
registerPainter("canvas", CanvasPainter)
registerPainter("svg", SVGPainter)

export abstract class BaseChart {
  // 组件管理器（集成配置管理和渲染调度）
  protected componentManager: ComponentManager
  // 全局组件池
  protected static globalComponents: ComponentConstructor[] = []
  // 实例池
  protected static instanceMap: WeakMap<HTMLElement, BaseChart> = new WeakMap()
  private zr: ZRenderType
  private dom: HTMLElement

  constructor(dom: HTMLElement, zr: ZRenderType) {
    this.zr = zr
    this.dom = dom
    this.componentManager = new ComponentManager(this)
    // 注册全局组件（只在第一个实例创建时需要）
    if (BaseChart.globalComponents.length > 0) {
      this.componentManager.register(BaseChart.globalComponents)
    }

    BaseChart.instanceMap.set(dom, this)
  }

  /**
   * 获取当前配置项（从 GlobalModel 获取完整配置）
   */
  public getOption(): ChartOption {
    return this.componentManager.getOption()
  }

  public getDom(): HTMLElement {
    return this.dom
  }

  public getWidth(): number {
    return this.zr.getWidth() ?? 0
  }

  public getHeight(): number {
    return this.zr.getHeight() ?? 0
  }

  public getZr(): ZRenderType {
    return this.zr
  }

  /**
   * 获取坐标变换参数（用于批量坐标转换）
   * 一次性返回 x/y 轴的 domain 和 pixelRange，避免逐点调用 convertToPixel
   */
  public getAxisTransform(finder?: CoordinateFinder): CoordinateTransform {
    return {
      x: this.getAxisTransformParams("x", finder),
      y: this.getAxisTransformParams("y", finder)
    }
  }

  /**
   * 数据坐标转像素坐标
   */
  public convertToPixel(finder: CoordinateFinder, value: number | [number, number]): number | [number, number] {
    const xAxisModel = this.getAxisModel("x")
    const yAxisModel = this.getAxisModel("y")
    const hasXFinder = finder?.xAxisIndex !== undefined || finder?.xAxisId !== undefined
    const hasYFinder = finder?.yAxisIndex !== undefined || finder?.yAxisId !== undefined

    if (Array.isArray(value)) {
      const xValue = value[0]
      const yValue = value[1]

      const xPixel = this.toAxisPixel(xAxisModel, finder, "x", xValue)
      const yPixel = this.toAxisPixel(yAxisModel, finder, "y", yValue)

      return [xPixel ?? xValue, yPixel ?? yValue]
    }

    if (hasYFinder && yAxisModel) {
      return this.toAxisPixel(yAxisModel, finder, "y", value) ?? value
    }

    if (hasXFinder && xAxisModel) {
      return this.toAxisPixel(xAxisModel, finder, "x", value) ?? value
    }

    if (xAxisModel && !yAxisModel) {
      return this.toAxisPixel(xAxisModel, finder, "x", value) ?? value
    }

    if (yAxisModel && !xAxisModel) {
      return this.toAxisPixel(yAxisModel, finder, "y", value) ?? value
    }

    if (xAxisModel) {
      return this.toAxisPixel(xAxisModel, finder, "x", value) ?? value
    }

    return value
  }

  /**
   * 像素坐标转数据坐标
   */
  public convertFromPixel(finder: CoordinateFinder, value: number | [number, number]): number | [number, number] {
    const xAxisModel = this.getAxisModel("x")
    const yAxisModel = this.getAxisModel("y")
    const hasXFinder = finder?.xAxisIndex !== undefined || finder?.xAxisId !== undefined
    const hasYFinder = finder?.yAxisIndex !== undefined || finder?.yAxisId !== undefined

    if (Array.isArray(value)) {
      const xValue = value[0]
      const yValue = value[1]

      const xData = this.fromAxisPixel(xAxisModel, finder, "x", xValue)
      const yData = this.fromAxisPixel(yAxisModel, finder, "y", yValue)

      return [xData ?? xValue, yData ?? yValue]
    }

    if (hasYFinder && yAxisModel) {
      return this.fromAxisPixel(yAxisModel, finder, "y", value) ?? value
    }

    if (hasXFinder && xAxisModel) {
      return this.fromAxisPixel(xAxisModel, finder, "x", value) ?? value
    }

    if (xAxisModel && !yAxisModel) {
      return this.fromAxisPixel(xAxisModel, finder, "x", value) ?? value
    }

    if (yAxisModel && !xAxisModel) {
      return this.fromAxisPixel(yAxisModel, finder, "y", value) ?? value
    }

    if (xAxisModel) {
      return this.fromAxisPixel(xAxisModel, finder, "x", value) ?? value
    }

    return value
  }

  /**
   * 判断像素点是否落在指定网格内
   */
  public containPixel(finder: CoordinateFinder, value: [number, number]): boolean {
    const gridModel = this.getGridModel()
    if (!gridModel) {
      return false
    }

    const gridIndex = this.resolveGridIndex(finder)
    const rect = gridModel.getRect(gridIndex)
    const [x, y] = value

    // 严格的边界检查：点必须完全在 grid 内部
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height
  }

  /**
   * 设置配置项（通过 ComponentManager 处理）
   */
  abstract setOption(option: InputChartOption): void

  /**
   * 调整图表尺寸
   * 容器大小改变后调用此方法重新布局和渲染
   *
   * @param opts 可选参数，指定新的宽高
   */
  public resize(opts?: { width?: number | string; height?: number | string }): void {
    // 1. 调整 ZRender 画布尺寸
    this.zr.resize(opts)

    // 2. 通知所有组件更新布局
    const newWidth = this.getWidth()
    const newHeight = this.getHeight()
    this.componentManager.resize({
      containerWidth: newWidth,
      containerHeight: newHeight
    })
  }

  // 实例方法：销毁当前图表
  public dispose(): void {
    // 1. 清理所有组件
    this.componentManager.clearAll()

    // 2. 销毁 ZRender 实例
    this.zr.dispose()

    // 4. 从实例池移除
    BaseChart.instanceMap.delete(this.dom)
  }

  private getAxisModel(axis: "x" | "y"): AxisModel | null {
    const type = axis === "x" ? ComponentType.XAxis : ComponentType.YAxis
    const component = this.componentManager.getComponent(type) as { getAxisModel?: () => AxisModel } | undefined
    return component?.getAxisModel?.() ?? null
  }

  private getGridModel(): GridModel | null {
    const component = this.componentManager.getComponent(ComponentType.Grid) as
      | { getGridModel?: () => GridModel }
      | undefined
    return component?.getGridModel?.() ?? null
  }

  /**
   * 获取瀑布图组件
   */
  public getWaterfallComponent(): any {
    return this.componentManager.getComponent(ComponentType.WaterfallSeries)
  }

  private toAxisPixel(
    axisModel: AxisModel | null,
    finder: CoordinateFinder | undefined,
    axis: "x" | "y",
    value: number
  ): number | null {
    if (!axisModel || typeof value !== "number") {
      return null
    }

    const gridModel = this.getGridModel()
    if (!gridModel) {
      return null
    }

    const axisIndex = this.resolveAxisIndex(axisModel, finder, axis)
    // 确保 GridModel 已设置
    axisModel.setGridModel(gridModel)

    try {
      const { range, position } = axisModel.getLayoutData(axisIndex)
      const axisOption = axisModel.getAxisOption(axisIndex)
      const gridIndex = axisOption?.gridIndex ?? 0
      const gridRect = gridModel.getRect(gridIndex)
      const isHorizontal = position === "top" || position === "bottom"
      const pixelRange: [number, number] = isHorizontal
        ? [gridRect.x, gridRect.x + gridRect.width]
        : [gridRect.y + gridRect.height, gridRect.y]

      return linearMap(value, range, pixelRange)
    } catch {
      return null
    }
  }

  private fromAxisPixel(
    axisModel: AxisModel | null,
    finder: CoordinateFinder | undefined,
    axis: "x" | "y",
    value: number
  ): number | null {
    if (!axisModel || typeof value !== "number") {
      return null
    }

    const gridModel = this.getGridModel()
    if (!gridModel) {
      return null
    }

    const axisIndex = this.resolveAxisIndex(axisModel, finder, axis)
    axisModel.setGridModel(gridModel)

    try {
      const { range, position } = axisModel.getLayoutData(axisIndex)
      const axisOption = axisModel.getAxisOption(axisIndex)
      const gridIndex = axisOption?.gridIndex ?? 0
      const gridRect = gridModel.getRect(gridIndex)
      const isHorizontal = position === "top" || position === "bottom"
      const pixelRange: [number, number] = isHorizontal
        ? [gridRect.x, gridRect.x + gridRect.width]
        : [gridRect.y + gridRect.height, gridRect.y]

      return linearMap(value, pixelRange, range)
    } catch {
      return null
    }
  }

  private resolveAxisIndex(axisModel: AxisModel, finder: CoordinateFinder | undefined, axis: "x" | "y"): number {
    const axisIndex = axis === "x" ? finder?.xAxisIndex : finder?.yAxisIndex
    if (typeof axisIndex === "number" && axisIndex >= 0) {
      return axisIndex
    }

    const axisId = axis === "x" ? finder?.xAxisId : finder?.yAxisId
    if (axisId) {
      const options = this.safeGetAxisOptions(axisModel)
      const index = options.findIndex(option => option.id === axisId)
      if (index >= 0) {
        return index
      }
    }

    return 0
  }

  private resolveGridIndex(finder: CoordinateFinder | undefined): number {
    const gridModel = this.getGridModel()
    if (!gridModel) {
      return 0
    }

    if (typeof finder?.gridIndex === "number" && finder.gridIndex >= 0) {
      return finder.gridIndex
    }

    if (finder?.gridId) {
      const gridOptions = gridModel.getOption?.() as Array<{ id?: string }> | undefined
      if (Array.isArray(gridOptions)) {
        const gridIndex = gridOptions.findIndex(option => option.id === finder.gridId)
        if (gridIndex >= 0) {
          return gridIndex
        }
      }
    }

    const xAxisModel = this.getAxisModel("x")
    if (xAxisModel && (finder?.xAxisIndex !== undefined || finder?.xAxisId !== undefined)) {
      const axisIndex = this.resolveAxisIndex(xAxisModel, finder, "x")
      const axisOption = xAxisModel.getAxisOption(axisIndex)
      if (axisOption?.gridIndex !== undefined) {
        return axisOption.gridIndex
      }
    }

    const yAxisModel = this.getAxisModel("y")
    if (yAxisModel && (finder?.yAxisIndex !== undefined || finder?.yAxisId !== undefined)) {
      const axisIndex = this.resolveAxisIndex(yAxisModel, finder, "y")
      const axisOption = yAxisModel.getAxisOption(axisIndex)
      if (axisOption?.gridIndex !== undefined) {
        return axisOption.gridIndex
      }
    }

    return 0
  }

  private safeGetAxisOptions(axisModel: AxisModel): AxisOption[] {
    try {
      const options = axisModel.getOption()
      return Array.isArray(options) ? options : []
    } catch {
      return []
    }
  }

  /**
   * 获取单轴的变换参数
   */
  private getAxisTransformParams(axis: "x" | "y", finder?: CoordinateFinder): AxisTransformParams | null {
    const axisModel = this.getAxisModel(axis)
    if (!axisModel) {
      return null
    }

    const gridModel = this.getGridModel()
    if (!gridModel) {
      return null
    }

    const axisIndex = this.resolveAxisIndex(axisModel, finder, axis)
    axisModel.setGridModel(gridModel)

    try {
      const { range, position } = axisModel.getLayoutData(axisIndex)
      const axisOption = axisModel.getAxisOption(axisIndex)
      const gridIndex = axisOption?.gridIndex ?? 0
      const gridRect = gridModel.getRect(gridIndex)
      const isHorizontal = position === "top" || position === "bottom"
      const pixelRange: [number, number] = isHorizontal
        ? [gridRect.x, gridRect.x + gridRect.width]
        : [gridRect.y + gridRect.height, gridRect.y]

      return { domain: range, pixelRange }
    } catch {
      return null
    }
  }
}

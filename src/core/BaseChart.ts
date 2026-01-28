import { ChartOption, ComponentConstructor, InputChartOption } from "@/types"
import { ComponentManager } from "./ComponentManage"
import { registerPainter, type ZRenderType } from "zrender"
import CanvasPainter from "zrender/lib/canvas/Painter"
import SVGPainter from "zrender/lib/svg/Painter"
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
   * 设置配置项（通过 ComponentManager 处理）
   */
  abstract setOption(option: InputChartOption): void

  // 实例方法：销毁当前图表
  public dispose(): void {
    // 1. 清理所有组件
    this.componentManager.clearAll()

    // 2. 销毁 ZRender 实例
    this.zr.dispose()

    // 4. 从实例池移除
    BaseChart.instanceMap.delete(this.dom)
  }
}

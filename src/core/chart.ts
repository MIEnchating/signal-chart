import { ComponentManager } from "./componentManage"
import type { ChartOption, ComponentConstructor, ZRenderInitOptions, InputChartOption } from "@/types"
import { init, registerPainter } from "zrender"
import type { ZRenderType } from "zrender"
import CanvasPainter from "zrender/lib/canvas/Painter"
import SVGPainter from "zrender/lib/svg/Painter"
import { Scheduler } from "./schedule"
registerPainter("canvas", CanvasPainter)
registerPainter("svg", SVGPainter)

export class Chart {
  private dom: HTMLElement
  // 组件管理器
  private componentManager: ComponentManager
  // 全局组件池
  private static globalComponents: ComponentConstructor[] = []
  // 实例池
  private static instanceMap: Map<HTMLElement, Chart> = new Map()
  // 渲染器实例
  private zr: ZRenderType
  // 调度器（负责处理option和渲染）
  private scheduler: Scheduler

  // 构造函数私有，使用静态方法创建实例
  private constructor(dom: HTMLElement, option: ZRenderInitOptions) {
    this.dom = dom
    this.zr = init(dom, option as any)
    this.componentManager = new ComponentManager(this.zr)

    // 注册全局组件（只在第一个实例创建时需要）
    if (Chart.globalComponents.length > 0) {
      this.componentManager.register(Chart.globalComponents)
    }

    // 创建调度器
    this.scheduler = new Scheduler(this.componentManager)

    Chart.instanceMap.set(dom, this)
  }

  /**
   * 获取当前配置项（包含各 Model 的默认值）
   * 返回的是从各组件 Model 收集的实际配置
   */
  public getOption(): ChartOption {
    return this.scheduler.getOption()
  }

  // 设置配置项
  public setOption(option: InputChartOption): void {
    this.scheduler.processOption(option)
  }

  public static init(dom: HTMLElement, option: ZRenderInitOptions): Chart {
    if (!dom) {
      throw new Error("初始化 Chart 时，必须提供有效的 DOM 容器。")
    }
    if (dom.offsetWidth === 0 || dom.offsetHeight === 0) {
      console.warn("初始化 Chart 时，传入的 DOM 容器宽高为 0，可能导致渲染异常。请确保容器有明确的宽高设置。")
    }
    let instance = Chart.instanceMap.get(dom)
    if (instance) {
      console.warn("该 DOM 已绑定 Chart 实例，将销毁旧实例。")
      instance.dispose()
    }
    instance = new Chart(dom, option)
    return instance
  }

  public static getInstanceByDom(dom: HTMLElement): Chart | undefined {
    return this.instanceMap.get(dom)
  }

  // 实例方法：销毁当前图表
  public dispose(): void {
    // 1. 清理所有组件
    this.componentManager.clearAll()

    // 2. 销毁 ZRender 实例
    this.zr.dispose()

    // 4. 从实例池移除
    Chart.instanceMap.delete(this.dom)
  }

  // 静态方法：通过 DOM 销毁
  public static dispose(dom: HTMLElement): void {
    const instance = this.instanceMap.get(dom)
    if (instance) {
      instance.dispose()
    }
  }

  public static use(component: ComponentConstructor | ComponentConstructor[]) {
    const comps = Array.isArray(component) ? component : [component]
    this.globalComponents.push(...comps)
  }
}

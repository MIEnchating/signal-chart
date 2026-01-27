import { ComponentManager } from "./componentManage"
import { ChartOption, ComponentConstructor, Opts } from "./type"
import { init, registerPainter } from "zrender"
import type { ZRenderType } from "zrender"
import CanvasPainter from "zrender/lib/canvas/Painter"
import SVGPainter from "zrender/lib/svg/Painter"
import { Scheduler } from "./schedule"
import { DeepPartial } from "@/utils/options"
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
  private scheduler: Scheduler | null = null
  // 构造函数私有，使用静态方法创建实例
  private constructor(dom: HTMLElement, option: Opts) {
    this.dom = dom
    this.zr = init(dom, option as any)
    this.componentManager = new ComponentManager(this.zr)
    // 注册全局组件
    Chart.globalComponents.forEach(comp => {
      this.componentManager.register(comp)
    })
    Chart.instanceMap.set(dom, this)
  }

  /**
   * 获取当前配置项（已规范化）
   * 返回的是经过 Scheduler 规范化处理后的配置，而非用户原始输入
   */
  public getOption(): ChartOption | undefined {
    return this.scheduler?.option
  }
  // 设置配置项
  public setOption(option: DeepPartial<ChartOption>): void {
    if (!this.scheduler) {
      this.scheduler = new Scheduler(this.componentManager, option)
    }
    this.scheduler.processOption(option)
  }

  public static init(dom: HTMLElement, option: Opts): Chart {
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

import type { ZRenderInitOptions, InputChartOption, ComponentConstructor } from "@/types"
import { init } from "zrender"
import { BaseChart } from "./BaseChart"

export class Chart extends BaseChart {
  // 构造函数私有，使用静态方法创建实例
  private constructor(dom: HTMLElement, option?: ZRenderInitOptions) {
    const initOption = option ?? { renderer: "canvas" }
    super(dom, init(dom, initOption as any))
  }

  /**
   * 设置配置项（通过 ComponentManager 处理）
   * 用于配置变更，会走完整的合并、规范化、通知流程
   */
  public setOption(option: InputChartOption): void {
    this.componentManager.processOption(option)
  }

  /**
   * 高性能数据更新（统一数据源）
   *
   * 自动分发给所有 series，内部根据 series.type 决定行为：
   * - line/spectrum：替换当前数据
   * - waterfall：追加到滚动窗口
   *
   * @param data 一帧频谱数据（一维数组）
   *
   * @example
   * // 每次收到新数据时调用，自动更新所有关联的图表
   * chart.setData(newSpectrumFrame)
   */
  public setData(data: number[]): void {
    this.componentManager.broadcastData(data)
  }

  public static init(dom: HTMLElement, option?: ZRenderInitOptions): Chart {
    if (!dom) {
      throw new Error("初始化 Chart 时，必须提供有效的 DOM 容器。")
    }
    if (dom.offsetWidth === 0 || dom.offsetHeight === 0) {
      console.warn("初始化 Chart 时，传入的 DOM 容器宽高为 0，可能导致渲染异常。请确保容器有明确的宽高设置。")
    }
    const existing = Chart.instanceMap.get(dom)
    if (existing) {
      console.warn("该 DOM 已绑定 Chart 实例，将销毁旧实例。")
      existing.dispose()
    }
    const instance = new Chart(dom, option)
    return instance
  }

  public static getInstanceByDom(dom: HTMLElement): Chart | undefined {
    return this.instanceMap.get(dom) as Chart | undefined
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

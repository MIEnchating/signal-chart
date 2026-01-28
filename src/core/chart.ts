import type { ZRenderInitOptions, InputChartOption, ComponentConstructor } from "@/types"
import { init } from "zrender"
import { BaseChart } from "./BaseChart"

export class Chart extends BaseChart {
  // 构造函数私有，使用静态方法创建实例
  private constructor(dom: HTMLElement, option: ZRenderInitOptions) {
    super(dom, init(dom, option as any))
  }

  /**
   * 设置配置项（通过 ComponentManager 处理）
   */
  public setOption(option: InputChartOption): void {
    this.componentManager.processOption(option)
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

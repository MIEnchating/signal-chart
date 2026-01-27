import { ComponentSpec, ComponentType } from "@/component/component"
import { ZRenderType } from "zrender"
import { ChartOption, ComponentConstructor } from "./type"

// 组件管理
export class ComponentManager {
  // 存放组件
  private components: Map<ComponentType, ComponentSpec> = new Map()
  /**
   *
   * @param chart 图表实例
   * @param zr 渲染器
   */
  constructor(public zr: ZRenderType) {}
  // 注册组件
  register(component: ComponentConstructor | ComponentConstructor[]) {
    const comps = Array.isArray(component) ? component : [component]
    comps.forEach(comp => {
      const compInstance = new comp({ zr: this.zr })
      this.components.set(compInstance.type, compInstance)
    })
    this.setupDependencies()
    this.initAll()
  }

  // 建立组件依赖关系
  private setupDependencies(): void {
    const grid = this.components.get("grid" as any)
    const xAxis = this.components.get("xAxis" as any)
    const yAxis = this.components.get("yAxis" as any)

    // Axis 组件依赖 Grid
    if (grid && xAxis && "setGridComponent" in xAxis) {
      ;(xAxis as any).setGridComponent(grid)
    }
    if (grid && yAxis && "setGridComponent" in yAxis) {
      ;(yAxis as any).setGridComponent(grid)
    }
  }

  // 通知所有组件更新
  notifyAll(option: ChartOption) {
    this.components.forEach(component => {
      component.onOptionUpdate(option)
    })
  }

  // 获取组件
  getComponent(type: ComponentType): ComponentSpec | undefined {
    return this.components.get(type)
  }

  // 销毁组件
  destroy(type: ComponentType): void {
    const component = this.components.get(type)
    if (component) {
      component.destroy()
      this.components.delete(type)
    } else {
      console.warn(`组件 ${type} 不存在，无法销毁。`)
    }
  }

  // 初始化所有组件
  public initAll(): void {
    this.components.forEach(component => {
      component.init()
    })
  }

  // 更新所有组件（按依赖顺序）
  updateAll(data: any): void {
    // 定义更新顺序：Grid -> Axis -> Series
    const updateOrder = ["grid", "xAxis", "yAxis", "series"]

    updateOrder.forEach(type => {
      const component = this.components.get(type as any)
      if (component && component.dirty) {
        component.update(data)
      }
    })

    // 更新其他组件
    this.components.forEach((component, type) => {
      if (!updateOrder.includes(type as string) && component.dirty) {
        component.update(data)
      }
    })
  }
  // 清除所有组件
  clearAll(): void {
    this.components.forEach(component => {
      component.clear()
    })
    this.components.clear()
  }
}

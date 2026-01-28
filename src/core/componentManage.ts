import type { ComponentInstance, ComponentConstructor, ChartOption } from "@/types"
import { ComponentType } from "@/types"
import type { ZRenderType } from "zrender"
import { BaseComponent } from "@/component/baseComponent"

// 组件管理
export class ComponentManager {
  // 存放组件
  private components: Map<ComponentType, ComponentInstance> = new Map()
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

  /**
   * 自动建立组件依赖关系
   *
   * 遍历所有组件，根据其静态 dependencies 属性自动注入依赖
   * 支持类型安全的依赖声明，避免手动硬编码
   */
  private setupDependencies(): void {
    this.components.forEach((component, _type) => {
      // 获取组件类的静态 dependencies 属性
      const ComponentClass = component.constructor as typeof BaseComponent
      const deps = ComponentClass.dependencies || []

      // 如果组件没有依赖，跳过
      if (deps.length === 0) {
        return
      }

      // 收集依赖的组件实例
      const dependencyMap = new Map<ComponentType, ComponentInstance>()
      deps.forEach(depType => {
        const depComponent = this.components.get(depType)
        if (depComponent) {
          dependencyMap.set(depType, depComponent)
        } else {
          console.warn(`组件 ${component.type} 依赖的组件 ${depType} 不存在`)
        }
      })

      // 调用组件的依赖注入钩子
      if (component.onDependenciesReady) {
        component.onDependenciesReady(dependencyMap)
      }
    })
  }

  // 通知所有组件更新
  notifyAll(option: ChartOption) {
    this.components.forEach(component => {
      component.onOptionUpdate(option)
    })
  }

  // 获取组件
  getComponent(type: ComponentType): ComponentInstance | undefined {
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
    // 使用拓扑排序确定更新顺序
    const sortedComponents = this.topologicalSort()

    sortedComponents.forEach(component => {
      if (component.dirty) {
        console.log(`  🖌️  渲染 [${component.type}]`)
        component.update(data)
      } else {
        console.log(`  ⏭️  跳过 [${component.type}] (无变化)`)
      }
    })
    console.log("渲染完成。\n")
  }

  /**
   * 拓扑排序：根据组件依赖关系确定更新顺序
   *
   * 算法：
   * 1. 没有依赖的组件先更新（如 Grid）
   * 2. 依赖已更新组件的组件后更新（如 Axis 依赖 Grid）
   * 3. 确保依赖关系正确的渲染顺序
   */
  private topologicalSort(): ComponentInstance[] {
    const sorted: ComponentInstance[] = []
    const visited = new Set<ComponentType>()

    const visit = (component: ComponentInstance) => {
      if (visited.has(component.type)) return

      // 先访问依赖的组件
      const ComponentClass = component.constructor as typeof BaseComponent
      const deps = ComponentClass.dependencies || []

      deps.forEach(depType => {
        const depComponent = this.components.get(depType)
        if (depComponent) {
          visit(depComponent)
        }
      })

      // 再访问当前组件
      visited.add(component.type)
      sorted.push(component)
    }

    // 遍历所有组件
    this.components.forEach(component => {
      visit(component)
    })

    return sorted
  }
  // 清除所有组件
  clearAll(): void {
    this.components.forEach(component => {
      component.clear()
    })
    this.components.clear()
  }
}

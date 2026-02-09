import type { ComponentInstance, ComponentConstructor, ChartOption, InputChartOption, ModelContext } from "@/types"
import { ComponentType } from "@/types"
import { BaseComponent } from "@/component/BaseComponent"
import { GlobalModel, type ConfigChangeSet } from "./GlobalModel"
import { BaseChart } from "./BaseChart"
import type { LineSeriesComponent } from "@/component/LineSeriesComponent"
import type { WaterfallSeriesComponent } from "@/component/WaterfallSeriesComponent"

/**
 * 配置键到组件类型的映射
 * 用于精准通知：只通知受影响的组件
 */
const CONFIG_TO_COMPONENT: Record<string, ComponentType[]> = {
  grid: [ComponentType.Grid],
  xAxis: [ComponentType.XAxis],
  yAxis: [ComponentType.YAxis],
  visualMap: [ComponentType.VisualMap],
  tooltip: [ComponentType.Tooltip],
  series: [ComponentType.LineSeries, ComponentType.WaterfallSeries],
  backgroundColor: [] // 背景色变化不需要通知组件
}

// 组件管理
export class ComponentManager {
  // 存放组件
  private components: Map<ComponentType, ComponentInstance> = new Map()
  // 全局配置模型
  private globalModel: GlobalModel
  // 缓存拓扑排序结果
  private sortedComponents: ComponentInstance[] = []
  // 标记缓存是否失效
  private sortCacheDirty = true

  constructor(public chart: BaseChart) {
    this.globalModel = new GlobalModel()
  }

  // 注册组件
  register(component: ComponentConstructor | ComponentConstructor[]) {
    const comps = Array.isArray(component) ? component : [component]
    comps.forEach(comp => {
      const compInstance = new comp({ chart: this.chart, globalModel: this.globalModel })
      this.components.set(compInstance.type, compInstance)
    })

    // 标记缓存失效（组件列表变化）
    this.sortCacheDirty = true

    this.setupDependencies()

    // 在初始化前，先通知所有组件更新配置
    const defaultOption = this.globalModel.getOption()
    this.notifyAll(defaultOption)

    this.initAll()
  }

  /**
   * 自动建立组件依赖关系
   */
  private setupDependencies(): void {
    this.components.forEach((component, _type) => {
      const ComponentClass = component.constructor as typeof BaseComponent
      const deps = ComponentClass.dependencies || []

      if (deps.length === 0) return

      const dependencyMap = new Map<ComponentType, ComponentInstance>()
      deps.forEach(depType => {
        const depComponent = this.components.get(depType)
        if (depComponent) {
          dependencyMap.set(depType, depComponent)
        } else {
          console.warn(`组件 ${component.type} 依赖的组件 ${depType} 不存在`)
        }
      })

      if (component.onDependenciesReady) {
        component.onDependenciesReady(dependencyMap)
      }
    })
  }

  /**
   * 获取当前完整配置
   */
  public getOption(): ChartOption {
    return this.globalModel.getOption()
  }

  /**
   * 处理配置更新（精准 diff + 精准通知）
   *
   * 优化策略：
   * 1. GlobalModel 返回变更的配置键
   * 2. 根据映射表，只通知受影响的组件
   * 3. 只更新 dirty 的组件
   */
  public processOption(newOption: InputChartOption): void {
    // 1. 更新 GlobalModel，获取变更集合
    const changedKeys = this.globalModel.mergeOption(newOption)

    // 2. 如果没有变化，直接返回
    if (changedKeys.size === 0) {
      return
    }

    // 3. 获取完整配置
    const fullOption = this.globalModel.getOption()

    // 4. 精准通知：只通知受影响的组件
    const affectedComponents = this.getAffectedComponents(changedKeys)
    this.notifyComponents(affectedComponents, fullOption)

    // 5. 执行渲染（只更新 dirty 的组件）
    this.updateAll(fullOption)
  }

  /**
   * 根据变更的配置键，获取受影响的组件
   */
  private getAffectedComponents(changedKeys: ConfigChangeSet): Set<ComponentType> {
    const affected = new Set<ComponentType>()

    for (const key of changedKeys) {
      const componentTypes = CONFIG_TO_COMPONENT[key] || []
      componentTypes.forEach(type => affected.add(type))
    }

    // 处理依赖传播：如果 Grid 变了，依赖它的组件也需要更新
    if (affected.has(ComponentType.Grid)) {
      affected.add(ComponentType.XAxis)
      affected.add(ComponentType.YAxis)
      affected.add(ComponentType.LineSeries)
      affected.add(ComponentType.WaterfallSeries)
    }

    // 如果 Axis 变了，Series 也需要更新（坐标系变化）
    if (affected.has(ComponentType.XAxis) || affected.has(ComponentType.YAxis)) {
      affected.add(ComponentType.LineSeries)
      affected.add(ComponentType.WaterfallSeries)
    }

    return affected
  }

  /**
   * 只通知受影响的组件
   */
  private notifyComponents(affectedTypes: Set<ComponentType>, option: ChartOption): void {
    affectedTypes.forEach(type => {
      const component = this.components.get(type)
      if (component) {
        component.onOptionUpdate(option)
      }
    })
  }

  /**
   * 通知所有组件（用于初始化等场景）
   */
  public notifyAll(option: ChartOption) {
    this.components.forEach(component => {
      component.onOptionUpdate(option)
    })
  }

  /**
   * 统一数据广播（高性能路径，跳过 diff）
   */
  public broadcastData(data: number[]): void {
    // 更新 LineSeries（替换数据）
    const lineSeriesComponent = this.components.get(ComponentType.LineSeries) as LineSeriesComponent | undefined
    if (lineSeriesComponent && typeof lineSeriesComponent.setDataAll === "function") {
      lineSeriesComponent.setDataAll(data)
    }

    // 更新 WaterfallSeries（追加数据）
    const waterfallComponent = this.components.get(ComponentType.WaterfallSeries) as WaterfallSeriesComponent | undefined
    if (waterfallComponent && typeof waterfallComponent.pushDataAll === "function") {
      waterfallComponent.pushDataAll(data)
    }
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

  // 更新所有组件（按依赖顺序，只更新 dirty 的）
  updateAll(data: any): void {
    const sortedComponents = this.getSortedComponents()

    sortedComponents.forEach(component => {
      if (component.dirty) {
        component.update(data)
      }
    })
  }

  /**
   * 获取排序后的组件列表（带缓存）
   * 只在组件注册时重新计算，运行时直接使用缓存
   */
  private getSortedComponents(): ComponentInstance[] {
    if (this.sortCacheDirty) {
      this.sortedComponents = this.topologicalSort()
      this.sortCacheDirty = false
    }
    return this.sortedComponents
  }

  /**
   * 拓扑排序：根据组件依赖关系确定更新顺序
   * 使用 DFS + 三色标记法检测循环依赖
   */
  private topologicalSort(): ComponentInstance[] {
    const sorted: ComponentInstance[] = []
    const visiting = new Set<ComponentType>() // 正在访问（灰色）
    const visited = new Set<ComponentType>()  // 已访问（黑色）
    const path: ComponentType[] = []          // 当前访问路径（用于错误提示）

    const visit = (component: ComponentInstance) => {
      const type = component.type

      // 已访问过，直接返回
      if (visited.has(type)) return

      // 正在访问中，说明存在循环依赖
      if (visiting.has(type)) {
        const cycleStart = path.indexOf(type)
        const cycle = [...path.slice(cycleStart), type]
        throw new Error(
          `[ComponentManager] 检测到循环依赖: ${cycle.join(' -> ')}`
        )
      }

      // 标记为正在访问
      visiting.add(type)
      path.push(type)

      const ComponentClass = component.constructor as typeof BaseComponent
      const deps = ComponentClass.dependencies || []

      // 递归访问所有依赖
      deps.forEach(depType => {
        const depComponent = this.components.get(depType)
        if (depComponent) {
          visit(depComponent)
        }
      })

      // 访问完成，标记为已访问
      visiting.delete(type)
      path.pop()
      visited.add(type)
      sorted.push(component)
    }

    this.components.forEach(component => {
      visit(component)
    })

    return sorted
  }

  /**
   * 处理容器尺寸变化
   */
  public resize(context: Partial<ModelContext>): void {
    this.components.forEach(component => {
      component.onResize(context)
    })

    const fullOption = this.globalModel.getOption()
    this.updateAll(fullOption)
  }

  // 清除所有组件
  clearAll(): void {
    this.components.forEach(component => {
      component.clear()
    })
    this.components.clear()
  }
}

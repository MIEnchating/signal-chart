import type { ChartOption, ComponentType, ComponentContext, ComponentInstance, ModelContext } from "@/types"
import type { ComponentModel } from "@/model/BaseModel"
import { BaseChart } from "@/core/BaseChart"
import { GlobalModel } from "@/core/GlobalModel"
import { performInjection } from "@/core/decorators"

// 组件规范接口
export abstract class BaseComponent implements ComponentInstance {
  // 组件名称
  abstract type: ComponentType
  // 是否需要更新
  dirty: boolean = true
  protected chart: BaseChart
  protected globalModel: GlobalModel

  /**
   * 声明组件依赖（静态属性）
   * 子类可以重写此属性来声明自己需要的依赖
   *
   * @example
   * class XAxisComponent extends BaseComponent {
   *   static dependencies = [ComponentType.Grid]
   * }
   */
  static dependencies: ComponentType[] = []

  constructor(context: ComponentContext) {
    this.chart = context.chart
    this.globalModel = context.globalModel
  }

  // 初始化组件
  abstract init(): void

  // 更新组件
  abstract update(data: any): void

  // 清除组件内容
  abstract clear(): void

  // 销毁组件
  abstract destroy(): void

  /**
   * 获取组件的 Model（子类实现）
   * 用于提供 Model 给其他组件使用
   */
  protected abstract getModel?(): ComponentModel<any> | null

  /**
   * 配置项更新（通用实现）
   * 自动处理 Model 更新和 dirty 标记
   * 子类无需重写，除非有特殊逻辑
   */
  onOptionUpdate(option: ChartOption): void {
    const model = this.getModel?.()

    if (model) {
      // Model.updateOption 返回 boolean 表示是否有变化
      const hasChanged = model.updateOption(option)

      if (hasChanged) {
        this.dirty = true
      }
    }
  }

  /**
   * 容器尺寸变化时调用（通用实现）
   * 自动更新 Model 的 context 并标记 dirty
   */
  onResize(context: Partial<ModelContext>): void {
    const model = this.getModel?.()

    if (model) {
      model.updateContext(context)
      this.dirty = true
    }
  }

  /**
   * 依赖注入钩子（生命周期）
   * 在所有依赖组件创建完成后调用
   *
   * ⚠️ 注意：如果使用 @Inject 装饰器，无需重写此方法
   * 装饰器会自动完成依赖注入
   *
   * 如果需要在依赖注入后执行额外逻辑，可以重写 `onDependenciesInjected()` 方法
   *
   * @param dependencies - 依赖的组件实例 Map
   */
  onDependenciesReady(dependencies: Map<ComponentType, ComponentInstance>): void {
    // 自动执行装饰器注入
    performInjection(this, dependencies)

    // 调用子类的后置钩子（如果存在）
    this.onDependenciesInjected?.(dependencies)
  }

  /**
   * 依赖注入完成后的钩子（可选）
   * 子类可以重写此方法来执行依赖注入后的初始化逻辑
   *
   * @example
   * class XAxisComponent extends BaseComponent {
   *   @Inject(ComponentType.Grid)
   *   private gridComponent!: GridComponent
   *
   *   protected onDependenciesInjected() {
   *     // 此时 this.gridComponent 已经被自动注入
   *     console.log('Grid component injected:', this.gridComponent)
   *   }
   * }
   */
  protected onDependenciesInjected?(dependencies: Map<ComponentType, ComponentInstance>): void
}

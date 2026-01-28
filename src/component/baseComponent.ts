import type { ChartOption, ComponentType, ComponentContext, ComponentInstance } from "@/types"
import type { ComponentModel } from "@/model/BaseModel"
import { BaseChart } from "@/core/BaseChart"

// 组件规范接口
export abstract class BaseComponent implements ComponentInstance {
  // 组件名称
  abstract type: ComponentType
  // 是否需要更新
  dirty: boolean = true
  protected chart: BaseChart

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
   * 依赖注入钩子（生命周期）
   * 在所有依赖组件创建完成后调用
   * 子类可以重写此方法来获取依赖的组件实例
   *
   * @param dependencies - 依赖的组件实例 Map
   */
  onDependenciesReady?(dependencies: Map<ComponentType, ComponentInstance>): void
}

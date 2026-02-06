/**
 * 组件依赖注入装饰器
 *
 * 使用示例：
 * ```typescript
 * class XAxisComponent extends BaseComponent {
 *   @Inject(ComponentType.Grid)
 *   private gridComponent!: GridComponent
 * }
 * ```
 */

import type { ComponentType, ComponentInstance } from "@/types"

/**
 * 注入信息接口
 */
export interface InjectionMetadata {
  propertyKey: string
  componentType: ComponentType
}

/**
 * 依赖注入装饰器
 * @param componentType 要注入的组件类型
 */
export function Inject(componentType: ComponentType) {
  return function (target: any, propertyKey: string) {
    const constructor = target.constructor

    // ⚠️ 关键修复：确保每个类有自己的 dependencies 数组
    // 不能直接修改原型链上的数组，否则会影响所有子类
    if (!constructor.hasOwnProperty('dependencies')) {
      // 创建新数组，继承父类的依赖
      const parentDeps = constructor.dependencies || []
      constructor.dependencies = [...parentDeps]
    }

    // 添加依赖（避免重复）
    if (!constructor.dependencies.includes(componentType)) {
      constructor.dependencies.push(componentType)
    }

    // 记录注入信息（用于自动赋值）
    if (!constructor.hasOwnProperty('_injections')) {
      // 创建新 Map，继承父类的注入信息
      const parentInjections = constructor._injections || new Map()
      constructor._injections = new Map(parentInjections)
    }
    constructor._injections.set(propertyKey, componentType)
  }
}

/**
 * 执行依赖注入
 * @param instance 组件实例
 * @param deps 依赖映射表
 */
export function performInjection(
  instance: any,
  deps: Map<ComponentType, ComponentInstance>
): void {
  const constructor = instance.constructor
  const injections: Map<string, ComponentType> = constructor._injections

  if (!injections) {
    return
  }

  // 遍历所有注入点，自动赋值
  injections.forEach((componentType, propertyKey) => {
    const dependency = deps.get(componentType)
    if (dependency) {
      instance[propertyKey] = dependency
    } else {
      console.warn(
        `[Inject] 依赖注入失败: ${constructor.name}.${propertyKey} 需要 ${componentType}，但未找到`
      )
    }
  })
}

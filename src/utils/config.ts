/**
 * 配置管理工具函数
 */

import type { DeepPartial } from "@/types"

// 判断是否为普通对象
function isPlainObject(v: unknown): v is Record<string, any> {
  if (v === null || typeof v !== "object") return false
  if (Array.isArray(v)) return false
  const proto = Object.getPrototypeOf(v)
  return proto === Object.prototype || proto === null
}

function deepMerge<T extends Record<string, any>>(base: T, patch: Partial<T>): T {
  const out: Record<string, any> = { ...base }

  for (const key of Object.keys(patch) as Array<keyof T>) {
    const pv = patch[key]
    if (pv === undefined) continue // 不用 undefined 覆盖默认值

    const bv = base[key]

    // 普通对象 -> 递归合并
    if (isPlainObject(bv) && isPlainObject(pv)) {
      out[key as string] = deepMerge(bv, pv)
      continue
    }

    // 数组/日期/函数/类实例等 -> 直接覆盖
    out[key as string] = pv
  }

  return out as T
}

/**
 * 合并默认配置和用户配置
 */
export function mergeOptions<T>(defaultOptions: T, options?: DeepPartial<T>): T {
  if (!options) {
    // 尽量返回副本，避免外部意外修改 defaultOptions
    if (Array.isArray(defaultOptions)) return [...(defaultOptions as any)] as T
    if (isPlainObject(defaultOptions)) return { ...(defaultOptions as any) } as T
    return defaultOptions
  }

  // defaultOptions 是普通对象 => 深度合并
  if (isPlainObject(defaultOptions)) {
    if (!isPlainObject(options)) return { ...(defaultOptions as any) } as T
    return deepMerge(defaultOptions as any, options as any) as T
  }

  // defaultOptions 不是普通对象（例如数组/类实例） => options 有则覆盖，否则默认
  return (options as T) ?? defaultOptions
}

/**
 * 深度比较两个值是否相等
 */
export function deepEqual(a: any, b: any): boolean {
  // 1. 相同引用或基本类型相等（包括 +0 === -0）
  if (a === b) return true

  // 2. 特殊处理 NaN（NaN !== NaN，但我们认为它们相等）
  if (typeof a === "number" && typeof b === "number" && Number.isNaN(a) && Number.isNaN(b)) {
    return true
  }

  // 3. null/undefined 处理（已经通过 === 比较过，走到这里必定不相等）
  if (a == null || b == null) return false

  // 4. 类型不同直接返回 false
  if (typeof a !== typeof b) return false

  // 5. 不是对象类型（string/number/boolean/symbol/bigint/function）
  //    走到这里说明 a !== b，直接返回 false
  if (typeof a !== "object") return false

  // 6. Date 对象特殊处理
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  // 7. RegExp 对象特殊处理
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags
  }

  // 8. 数组比较
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }

  // 9. 一个是数组一个不是
  if (Array.isArray(a) || Array.isArray(b)) return false

  // 10. 普通对象深度比较
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  return keysA.every(key => deepEqual(a[key], b[key]))
}

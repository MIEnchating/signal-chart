import { ChartOption } from "@/core/type"

export type AnyRecord = Record<string, any>
// 深度可选类型 - 让嵌套对象的属性也变成可选
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T

// 判断是否为普通对象
function isPlainObject(v: unknown): v is AnyRecord {
  if (v === null || typeof v !== "object") return false
  if (Array.isArray(v)) return false
  const proto = Object.getPrototypeOf(v)
  return proto === Object.prototype || proto === null
}

function deepMerge<T extends AnyRecord>(base: T, patch: Partial<T>): T {
  const out: AnyRecord = { ...base }

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

// 合并默认配置和用户配置
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

// 深度 diff option - 检测配置变化
export function diffOption(oldOpt: ChartOption, newOpt: ChartOption): Partial<ChartOption> {
  const changes: Partial<ChartOption> = {}

  // 使用深度比较而非引用比较
  if (!deepEqual(oldOpt.backgroundColor, newOpt.backgroundColor)) {
    changes.backgroundColor = newOpt.backgroundColor
  }
  if (!deepEqual(oldOpt.grid, newOpt.grid)) {
    changes.grid = newOpt.grid
  }
  if (!deepEqual(oldOpt.xAxis, newOpt.xAxis)) {
    changes.xAxis = newOpt.xAxis
  }
  if (!deepEqual(oldOpt.yAxis, newOpt.yAxis)) {
    changes.yAxis = newOpt.yAxis
  }
  if (!deepEqual(oldOpt.series, newOpt.series)) {
    changes.series = newOpt.series
  }

  return changes
}

/**
 * 深度比较两个值是否相等
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (a == null || b == null) return a === b

  if (typeof a !== typeof b) return false

  if (typeof a !== "object") return a === b

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }

  if (Array.isArray(a) || Array.isArray(b)) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  return keysA.every(key => deepEqual(a[key], b[key]))
}

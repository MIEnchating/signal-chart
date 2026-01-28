/**
 * 工具类型定义
 *
 * 包含通用的工具类型
 */

/**
 * 深度部分类型（递归）
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

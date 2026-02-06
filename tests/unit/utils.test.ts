/**
 * 工具函数测试示例
 */

import { describe, it, expect } from "vitest"
import { linearMap, batchLinearMap, createLinearScale } from "@/utils/scale"
import { normalizeAxis } from "@/utils/normalize"

describe("Scale Utils", () => {
  describe("linearMap", () => {
    it("应该正确映射数值", () => {
      const result = linearMap(5, [0, 10], [0, 100])
      expect(result).toBe(50)
    })

    it("应该处理反向映射", () => {
      const result = linearMap(5, [0, 10], [100, 0])
      expect(result).toBe(50)
    })

    it("应该处理边界值", () => {
      expect(linearMap(0, [0, 10], [0, 100])).toBe(0)
      expect(linearMap(10, [0, 10], [0, 100])).toBe(100)
    })

    it("应该处理负数范围", () => {
      const result = linearMap(0, [-10, 10], [0, 100])
      expect(result).toBe(50)
    })
  })

  describe("batchLinearMap", () => {
    it("应该批量映射数值", () => {
      const values = [0, 5, 10]
      const result = batchLinearMap(values, [0, 10], [0, 100])
      expect(result).toEqual([0, 50, 100])
    })

    it("应该处理空数组", () => {
      const result = batchLinearMap([], [0, 10], [0, 100])
      expect(result).toEqual([])
    })
  })

  describe("createLinearScale", () => {
    it("应该创建线性比例尺", () => {
      const scale = createLinearScale([0, 100], [0, 500])
      expect(scale).toBeDefined()
      expect(typeof scale).toBe("function")
      expect(scale(0)).toBe(0)
      expect(scale(50)).toBe(250)
      expect(scale(100)).toBe(500)
    })
  })
})

describe("Normalize Utils", () => {
  describe("normalizeAxis", () => {
    it("应该标准化单个配置为数组", () => {
      const option = { type: "value" as const } as any
      const result = normalizeAxis(option)

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(option)
    })

    it("应该保持数组配置不变", () => {
      const options = [{ type: "value" as const }, { type: "category" as const }] as any
      const result = normalizeAxis(options)

      expect(result).toEqual(options)
      expect(result).toHaveLength(2)
    })

    it("应该处理 undefined", () => {
      const result = normalizeAxis(undefined)
      expect(result).toEqual([])
    })
  })
})

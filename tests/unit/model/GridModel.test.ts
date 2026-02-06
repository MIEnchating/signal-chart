/**
 * GridModel 单元测试
 */

import { describe, it, expect, beforeEach } from "vitest"
import { GridModel } from "@/model/GridModel"

describe("GridModel", () => {
  let model: GridModel

  beforeEach(() => {
    model = new GridModel({
      containerWidth: 800,
      containerHeight: 600
    })
  })

  describe("初始化", () => {
    it("应该正确创建实例", () => {
      expect(model).toBeDefined()
      expect(model).toBeInstanceOf(GridModel)
    })
  })

  describe("getRect", () => {
    it("应该计算默认网格区域", () => {
      // 设置选项
      model.updateOption({
        grid: [
          {
            left: 60,
            right: 60,
            top: 60,
            bottom: 60
          }
        ]
      } as any)

      const rect = model.getRect(0)

      expect(rect).toBeDefined()
      expect(rect.x).toBe(60)
      expect(rect.y).toBe(60)
      expect(rect.width).toBe(680) // 800 - 60 - 60
      expect(rect.height).toBe(480) // 600 - 60 - 60
    })

    it("应该支持百分比定位", () => {
      model.updateOption({
        grid: [
          {
            left: "10%",
            right: "10%",
            top: "10%",
            bottom: "10%"
          }
        ]
      } as any)

      const rect = model.getRect(0)

      expect(rect.x).toBe(80) // 800 * 0.1
      expect(rect.y).toBe(60) // 600 * 0.1
      expect(rect.width).toBe(640) // 800 - 80 - 80
      expect(rect.height).toBe(480) // 600 - 60 - 60
    })

    it("应该支持多个网格", () => {
      model.updateOption({
        grid: [
          { left: 60, right: 260, top: 60, bottom: 340 },
          { left: 400, right: 100, top: 60, bottom: 340 }
        ]
      } as any)

      const rect1 = model.getRect(0)
      const rect2 = model.getRect(1)

      expect(rect1.x).toBe(60)
      expect(rect1.y).toBe(60)
      expect(rect2.x).toBe(400)
      expect(rect2.y).toBe(60)
    })
  })

  describe("缓存机制", () => {
    it("应该缓存计算结果", () => {
      model.updateOption({
        grid: [{ left: 60, right: 140, top: 60, bottom: 140 }]
      } as any)

      const rect1 = model.getRect(0)
      const rect2 = model.getRect(0)

      // 应该返回相同的引用（缓存）
      expect(rect1).toBe(rect2)
    })

    it("更新配置后应该清除缓存", () => {
      model.updateOption({
        grid: [{ left: 60, right: 140, top: 60, bottom: 140 }]
      } as any)

      const rect1 = model.getRect(0)

      model.updateOption({
        grid: [{ left: 80, right: 120, top: 80, bottom: 120 }]
      } as any)

      const rect2 = model.getRect(0)

      expect(rect1.x).toBe(60)
      expect(rect2.x).toBe(80)
    })
  })
})

/**
 * 组件测试示例
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { GridComponent } from "@/component/GridComponent"
import { ComponentType } from "@/types"

describe("GridComponent", () => {
  let component: GridComponent
  let mockContext: any

  beforeEach(() => {
    // Mock chart context
    mockContext = {
      chart: {
        getWidth: () => 800,
        getHeight: () => 600,
        getZr: () => ({
          add: vi.fn(),
          remove: vi.fn()
        })
      },
      globalModel: {
        getOption: () => ({
          grid: [
            {
              left: 60,
              right: 60,
              top: 60,
              bottom: 60
            }
          ],
          xAxis: [],
          yAxis: [],
          series: [],
          color: ["#5470c6", "#91cc75", "#fac858"]
        })
      }
    }

    component = new GridComponent(mockContext)
  })

  describe("基础属性", () => {
    it("应该有正确的类型", () => {
      expect(component.type).toBe(ComponentType.Grid)
    })

    it("应该能初始化", () => {
      expect(() => component.init()).not.toThrow()
    })
  })

  describe("更新和渲染", () => {
    it("应该能触发更新", () => {
      component.onOptionUpdate(mockContext.globalModel.getOption())
      expect(component["dirty"]).toBe(true)
    })

    it("更新后应该能渲染", () => {
      component.onOptionUpdate(mockContext.globalModel.getOption())
      expect(() => component.update()).not.toThrow()
    })

    it("渲染后 dirty 标记应该被清除", () => {
      component.onOptionUpdate(mockContext.globalModel.getOption())
      component.update()
      expect(component["dirty"]).toBe(false)
    })
  })

  describe("API 方法", () => {
    it("应该能获取 GridModel", () => {
      const model = component.getGridModel()
      expect(model).toBeDefined()
    })

    it("应该能获取网格矩形", () => {
      component.onOptionUpdate(mockContext.globalModel.getOption())
      const rect = component.getGridRect(0)

      expect(rect).toBeDefined()
      expect(typeof rect.x).toBe("number")
      expect(typeof rect.y).toBe("number")
      expect(typeof rect.width).toBe("number")
      expect(typeof rect.height).toBe("number")
    })
  })

  describe("清理和销毁", () => {
    it("应该能清除", () => {
      expect(() => component.clear()).not.toThrow()
    })

    it("应该能销毁", () => {
      expect(() => component.destroy()).not.toThrow()
    })
  })
})

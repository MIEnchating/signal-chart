/**
 * Chart 集成测试
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { Chart } from "@/core/chart"
import { GridComponent } from "@/component/GridComponent"
import { XAxisComponent } from "@/component/XAxisComponent"
import { YAxisComponent } from "@/component/YAxisComponent"
import { LineSeriesComponent } from "@/component/LineSeriesComponent"
import { createTestContainer, cleanupTestContainer } from "../utils"

describe("图表集成测试", () => {
  let container: HTMLDivElement
  let chart: any

  beforeEach(() => {
    // 注册组件
    Chart.use([GridComponent, XAxisComponent, YAxisComponent, LineSeriesComponent])

    // 创建容器
    container = createTestContainer()
  })

  afterEach(() => {
    if (chart) {
      chart.dispose()
    }
    cleanupTestContainer(container)
  })

  describe("初始化", () => {
    it("应该成功创建图表实例", () => {
      chart = Chart.init(container, {
        width: 800,
        height: 600,
        renderer: "canvas"
      })

      expect(chart).toBeDefined()

      expect(chart.getWidth()).toBe(800)
      expect(chart.getHeight()).toBe(600)
    })

    it("应该能获取 ZRender 实例", () => {
      chart = Chart.init(container)
      const zr = chart.getZr()

      expect(zr).toBeDefined()
      expect(typeof zr.add).toBe("function")
      expect(typeof zr.remove).toBe("function")
    })
  })

  describe("配置设置", () => {
    beforeEach(() => {
      chart = Chart.init(container)
    })

    it("应该能设置基础配置", () => {
      chart.setOption({
        xAxis: {
          min: 0,
          max: 10
        },
        yAxis: {
          min: 0,
          max: 100
        }
      })

      const option = chart.getOption()
      expect(option.xAxis).toBeDefined()
      expect(option.yAxis).toBeDefined()
    })

    it("应该能设置系列数据", () => {
      chart.setOption({
        xAxis: { min: 0, max: 10 },
        yAxis: { min: 0, max: 100 },
        series: [
          {
            type: "line",
            name: "测试系列",
            data: [10, 20, 30, 40, 50]
          }
        ]
      })

      const option = chart.getOption()
      expect(option.series).toHaveLength(1)
      expect(option.series[0].data).toHaveLength(5)
    })

    it("应该支持增量更新", () => {
      chart.setOption({
        xAxis: { min: 0, max: 10 }
      })

      chart.setOption({
        yAxis: { min: 0, max: 100 }
      })

      const option = chart.getOption()
      expect(option.xAxis).toBeDefined()
      expect(option.yAxis).toBeDefined()
    })
  })

  describe("坐标转换", () => {
    beforeEach(() => {
      chart = Chart.init(container, { width: 800, height: 600 })
      chart.setOption({
        grid: {
          left: 60,
          right: 60,
          top: 60,
          bottom: 60
        },
        xAxis: { min: 0, max: 10 },
        yAxis: { min: 0, max: 100 }
      })
    })

    it("应该能将数据坐标转换为像素坐标", () => {
      const pixel = chart.convertToPixel({ xAxisIndex: 0 }, [5, 50])

      expect(Array.isArray(pixel)).toBe(true)
      expect(pixel[0]).toBeGreaterThan(0)
      expect(pixel[1]).toBeGreaterThan(0)
    })

    it("应该能将像素坐标转换为数据坐标", () => {
      const data = chart.convertFromPixel({ xAxisIndex: 0 }, [400, 300])

      expect(Array.isArray(data)).toBe(true)
      expect(typeof data[0]).toBe("number")
      expect(typeof data[1]).toBe("number")
    })

    it("应该能判断点是否在网格内", () => {
      const isInside = chart.containPixel({ gridIndex: 0 }, [100, 100])
      expect(typeof isInside).toBe("boolean")
    })
  })

  describe("销毁", () => {
    it("应该能正确销毁图表", () => {
      chart = Chart.init(container)
      const dom = chart.getDom()

      chart.dispose()

      const instance = Chart.getInstanceByDom(dom)
      expect(instance).toBeUndefined()
    })
  })
})

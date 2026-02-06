/**
 * normalize 工具函数测试
 */

import { describe, it, expect } from 'vitest'
import {
  normalizeGrid,
  generateVisualMapFromSeries,
  normalizeChartOption
} from '@/utils/normalize'
import type { VisualMapOption } from '@/types'

describe('normalize utils', () => {
  describe('normalizeGrid', () => {
    it('should convert single object to array', () => {
      const grid = { top: 10, bottom: 10, left: 10, right: 10 }
      const result = normalizeGrid(grid)
      expect(result).toEqual([grid])
    })

    it('should keep array as is', () => {
      const grid = [
        { top: 10, bottom: 10, left: 10, right: 10 },
        { top: 20, bottom: 20, left: 20, right: 20 }
      ]
      const result = normalizeGrid(grid)
      expect(result).toEqual(grid)
    })

    it('should return empty array for undefined', () => {
      const result = normalizeGrid(undefined)
      expect(result).toEqual([])
    })
  })

  describe('generateVisualMapFromSeries', () => {
    it('should auto-generate visualMap from waterfall series', () => {
      const series = [
        {
          type: 'waterfall',
          colorMap: 'turbo',
          valueRange: [-100, 0]
        }
      ]
      const result = generateVisualMapFromSeries(series, [])

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        show: true,
        type: 'continuous',
        min: -100,
        max: 0,
        colorMap: 'turbo',
        seriesIndex: 0
      })
    })

    it('should not generate visualMap for non-waterfall series', () => {
      const series = [
        {
          type: 'line',
          colorMap: 'turbo',
          valueRange: [-100, 0]
        }
      ]
      const result = generateVisualMapFromSeries(series, [])

      expect(result).toHaveLength(0)
    })

    it('should not generate visualMap if colorMap is missing', () => {
      const series = [
        {
          type: 'waterfall',
          valueRange: [-100, 0]
        }
      ]
      const result = generateVisualMapFromSeries(series, [])

      expect(result).toHaveLength(0)
    })

    it('should not generate visualMap if valueRange is missing', () => {
      const series = [
        {
          type: 'waterfall',
          colorMap: 'turbo'
        }
      ]
      const result = generateVisualMapFromSeries(series, [])

      expect(result).toHaveLength(0)
    })

    it('should prioritize explicit visualMap over auto-generated', () => {
      const series = [
        {
          type: 'waterfall',
          colorMap: 'turbo',
          valueRange: [-100, 0]
        }
      ]
      const existingVisualMap: VisualMapOption[] = [
        {
          show: true,
          type: 'continuous',
          min: -80,
          max: -20,
          colorMap: 'viridis',
          seriesIndex: 0,
          orient: 'vertical',
          itemWidth: 30,
          itemHeight: 250,
          splitNumber: 10,
          textStyle: { color: '#fff', fontSize: 12 }
        }
      ]
      const result = generateVisualMapFromSeries(series, existingVisualMap)

      // Should only have the explicit one, not auto-generated
      expect(result).toHaveLength(1)
      expect(result[0].colorMap).toBe('viridis')
      expect(result[0].min).toBe(-80)
    })

    it('should handle multiple series with mixed types', () => {
      const series = [
        {
          type: 'line',
          data: []
        },
        {
          type: 'waterfall',
          colorMap: 'turbo',
          valueRange: [-100, 0]
        },
        {
          type: 'waterfall',
          colorMap: 'viridis',
          valueRange: [-80, -20]
        }
      ]
      const result = generateVisualMapFromSeries(series, [])

      expect(result).toHaveLength(2)
      expect(result[0].seriesIndex).toBe(1)
      expect(result[0].colorMap).toBe('turbo')
      expect(result[1].seriesIndex).toBe(2)
      expect(result[1].colorMap).toBe('viridis')
    })

    it('should merge explicit and auto-generated visualMaps', () => {
      const series = [
        {
          type: 'waterfall',
          colorMap: 'turbo',
          valueRange: [-100, 0]
        },
        {
          type: 'waterfall',
          colorMap: 'viridis',
          valueRange: [-80, -20]
        }
      ]
      const existingVisualMap: VisualMapOption[] = [
        {
          show: true,
          type: 'continuous',
          min: -60,
          max: -10,
          colorMap: 'plasma',
          seriesIndex: 0,
          orient: 'vertical',
          itemWidth: 20,
          itemHeight: 200,
          splitNumber: 5,
          textStyle: { color: '#ccc', fontSize: 10 }
        }
      ]
      const result = generateVisualMapFromSeries(series, existingVisualMap)

      // Should have explicit (index 0) + auto-generated (index 1)
      expect(result).toHaveLength(2)
      expect(result[0].colorMap).toBe('plasma') // explicit
      expect(result[1].colorMap).toBe('viridis') // auto-generated for index 1
    })
  })

  describe('normalizeChartOption', () => {
    it('should auto-generate visualMap from series config', () => {
      const option = {
        series: [
          {
            type: 'waterfall',
            colorMap: 'turbo',
            valueRange: [-100, 0]
          }
        ]
      }
      const result = normalizeChartOption(option)

      expect(result.visualMap).toHaveLength(1)
      expect(result.visualMap[0]).toMatchObject({
        min: -100,
        max: 0,
        colorMap: 'turbo',
        seriesIndex: 0
      })
    })

    it('should preserve explicit visualMap config', () => {
      const option = {
        visualMap: [
          {
            show: true,
            type: 'continuous' as const,
            min: -80,
            max: -20,
            colorMap: 'viridis' as const,
            seriesIndex: 0,
            orient: 'vertical' as const,
            itemWidth: 30,
            itemHeight: 250,
            splitNumber: 10,
            textStyle: { color: '#fff', fontSize: 12 }
          }
        ],
        series: [
          {
            type: 'waterfall',
            colorMap: 'turbo',
            valueRange: [-100, 0]
          }
        ]
      }
      const result = normalizeChartOption(option)

      // Should only have explicit config
      expect(result.visualMap).toHaveLength(1)
      expect(result.visualMap[0].colorMap).toBe('viridis')
    })

    it('should normalize all config arrays', () => {
      const option = {
        grid: { top: 10, bottom: 10, left: 10, right: 10 },
        xAxis: { gridIndex: 0, min: 0, max: 100 },
        yAxis: { gridIndex: 0, min: 0, max: 100 },
        series: [
          {
            type: 'waterfall',
            colorMap: 'turbo',
            valueRange: [-100, 0]
          }
        ]
      }
      const result = normalizeChartOption(option)

      expect(Array.isArray(result.grid)).toBe(true)
      expect(Array.isArray(result.xAxis)).toBe(true)
      expect(Array.isArray(result.yAxis)).toBe(true)
      expect(Array.isArray(result.visualMap)).toBe(true)
      expect(Array.isArray(result.series)).toBe(true)
    })
  })
})

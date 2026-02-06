/**
 * 比例尺工具
 *
 * 封装坐标映射、数据转换等工具函数
 * 内部使用 D3 实现，但不直接暴露 D3 API
 */

// 导入 D3 函数供内部使用（不对外暴露）
import { scaleLinear, scaleSequential } from "d3-scale"
import {
  interpolateViridis,
  interpolateInferno,
  interpolatePlasma,
  interpolateTurbo,
  interpolateCool,
  interpolateWarm
} from "d3-scale-chromatic"

/**
 * 创建线性比例尺
 * @param domain 数据域 [min, max]
 * @param range 值域 [min, max]
 * @returns D3 线性比例尺
 */
export function createLinearScale(domain: [number, number], range: [number, number]) {
  return scaleLinear().domain(domain).range(range)
}

/**
 * 线性映射：将数据值映射到像素值
 * 使用 D3 的 scaleLinear 实现
 *
 * @param value 数据值
 * @param domain 数据域 [min, max]
 * @param range 值域 [min, max]
 * @returns 映射后的值
 */
export function linearMap(value: number, domain: [number, number], range: [number, number]): number {
  return scaleLinear().domain(domain).range(range)(value)
}

/**
 * 批量线性映射
 * 使用 D3 的 scaleLinear 实现，创建一次比例尺后批量映射
 *
 * @param values 数据值数组
 * @param domain 数据域 [min, max]
 * @param range 值域 [min, max]
 * @returns 映射后的值数组
 */
export function batchLinearMap(values: number[], domain: [number, number], range: [number, number]): number[] {
  const scale = scaleLinear().domain(domain).range(range)
  return values.map(scale)
}

/**
 * 颜色映射方案类型
 */
export type ColorMapType = "viridis" | "inferno" | "plasma" | "turbo" | "cool" | "warm"

/**
 * 创建颜色映射比例尺
 * 用于将数值映射到颜色（常用于热力图、瀑布图）
 *
 * @param domain 数据域 [min, max]
 * @param colorMap 颜色映射方案
 * @returns 数值到颜色的映射函数
 */
export function createColorScale(domain: [number, number], colorMap: ColorMapType = "viridis") {
  const interpolators = {
    viridis: interpolateViridis,
    inferno: interpolateInferno,
    plasma: interpolatePlasma,
    turbo: interpolateTurbo,
    cool: interpolateCool,
    warm: interpolateWarm
  }

  return scaleSequential(interpolators[colorMap]).domain(domain)
}

/**
 * 批量颜色映射
 * 将数值数组映射为颜色数组
 *
 * @param values 数据值数组
 * @param domain 数据域 [min, max]
 * @param colorMap 颜色映射方案
 * @returns 颜色字符串数组
 */
export function batchColorMap(
  values: number[],
  domain: [number, number],
  colorMap: ColorMapType = "viridis"
): string[] {
  const scale = createColorScale(domain, colorMap)
  return values.map(v => scale(v))
}

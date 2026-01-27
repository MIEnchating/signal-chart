/**
 * 格式化工具函数
 */

/**
 * 格式化数字，添加单位
 * @param value 数值
 * @param precision 精度（小数位数）
 * @param unit 单位
 * @returns 格式化后的字符串
 */
export function formatNumber(value: number, precision: number = 2, unit: string = ""): string {
  const fixed = value.toFixed(precision)
  return unit ? `${fixed}${unit}` : fixed
}

/**
 * 计算美观的刻度值（Nice Numbers 算法）
 * @param min 最小值
 * @param max 最大值
 * @param splitNumber 期望的分段数
 * @returns 刻度数组
 */
export function calculateNiceTicks(min: number, max: number, splitNumber: number = 5): number[] {
  if (min === max) {
    return [min]
  }

  const range = niceNumber(max - min, false)
  const tickSpacing = niceNumber(range / (splitNumber - 1), true)
  const niceMin = Math.floor(min / tickSpacing) * tickSpacing
  const niceMax = Math.ceil(max / tickSpacing) * tickSpacing

  const ticks: number[] = []
  for (let tick = niceMin; tick <= niceMax + tickSpacing * 0.5; tick += tickSpacing) {
    // 处理浮点数精度问题
    const roundedTick = Math.round(tick / tickSpacing) * tickSpacing
    ticks.push(roundedTick)
  }

  return ticks
}

/**
 * Nice Number 算法辅助函数
 * @param value 值
 * @param round 是否四舍五入
 * @returns 美观的数字
 */
function niceNumber(value: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(value))
  const fraction = value / Math.pow(10, exponent)

  let niceFraction: number

  if (round) {
    if (fraction < 1.5) niceFraction = 1
    else if (fraction < 3) niceFraction = 2
    else if (fraction < 7) niceFraction = 5
    else niceFraction = 10
  } else {
    if (fraction <= 1) niceFraction = 1
    else if (fraction <= 2) niceFraction = 2
    else if (fraction <= 5) niceFraction = 5
    else niceFraction = 10
  }

  return niceFraction * Math.pow(10, exponent)
}

/**
 * 格式化频率值（Hz, kHz, MHz）
 * @param value 频率值（Hz）
 * @param precision 精度
 * @returns 格式化后的字符串
 */
export function formatFrequency(value: number, precision: number = 1): string {
  if (value >= 1e6) {
    return formatNumber(value / 1e6, precision, " MHz")
  } else if (value >= 1e3) {
    return formatNumber(value / 1e3, precision, " kHz")
  } else {
    return formatNumber(value, precision, " Hz")
  }
}

/**
 * 格式化时间值
 * @param value 时间值（秒）
 * @param precision 精度
 * @returns 格式化后的字符串
 */
export function formatTime(value: number, precision: number = 2): string {
  if (value >= 60) {
    const minutes = Math.floor(value / 60)
    const seconds = value % 60
    return `${minutes}:${seconds.toFixed(0).padStart(2, "0")}`
  } else {
    return formatNumber(value, precision, "s")
  }
}

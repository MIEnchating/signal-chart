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

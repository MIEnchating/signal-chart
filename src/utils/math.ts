/**
 * 数学计算工具函数
 */

/**
 * 线性映射：将数据值映射到像素值
 * @param dataValue 数据值
 * @param dataRange 数据范围 [min, max]
 * @param pixelRange 像素范围 [min, max]
 * @returns 映射后的像素值
 */
export function linearMap(dataValue: number, dataRange: [number, number], pixelRange: [number, number]): number {
  const [dataMin, dataMax] = dataRange
  const [pixelMin, pixelMax] = pixelRange

  if (dataMax === dataMin) {
    return pixelMin
  }

  const ratio = (dataValue - dataMin) / (dataMax - dataMin)
  return pixelMin + ratio * (pixelMax - pixelMin)
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

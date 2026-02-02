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

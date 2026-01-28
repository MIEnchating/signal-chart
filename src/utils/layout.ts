/**
 * 布局计算工具函数
 */

/**
 * 解析百分比或数值字符串/数值
 * @param value 配置值（如 "10%", 100, "50"）
 * @param total 总尺寸（用于计算百分比）
 * @returns 像素值
 */
export function parsePercent(value: number | string, total: number): number {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const trimmed = value.trim()

    // 处理百分比
    if (trimmed.endsWith("%")) {
      const percent = parseFloat(trimmed)
      return (percent / 100) * total
    }

    // 处理纯数字字符串
    const num = parseFloat(trimmed)
    return isNaN(num) ? 0 : num
  }

  return 0
}

/**
 * 计算矩形区域
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @param top 上边距
 * @param bottom 下边距
 * @param left 左边距
 * @param right 右边距
 * @returns 矩形区域 { x, y, width, height }
 */
export function calculateRect(
  containerWidth: number,
  containerHeight: number,
  top: number | string,
  bottom: number | string,
  left: number | string,
  right: number | string
): { x: number; y: number; width: number; height: number } {
  const topPx = parsePercent(top, containerHeight)
  const bottomPx = parsePercent(bottom, containerHeight)
  const leftPx = parsePercent(left, containerWidth)
  const rightPx = parsePercent(right, containerWidth)

  return {
    x: leftPx,
    y: topPx,
    width: Math.max(0, containerWidth - leftPx - rightPx),
    height: Math.max(0, containerHeight - topPx - bottomPx)
  }
}

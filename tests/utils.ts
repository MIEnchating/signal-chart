/**
 * 测试工具函数
 */

/**
 * 创建测试用的 DOM 容器
 */
export function createTestContainer(width = 800, height = 600): HTMLDivElement {
  const container = document.createElement("div")
  container.style.width = `${width}px`
  container.style.height = `${height}px`
  document.body.appendChild(container)
  return container
}

/**
 * 清理测试容器
 */
export function cleanupTestContainer(container: HTMLElement): void {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container)
  }
}

/**
 * 等待指定时间
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 等待下一帧
 */
export function waitForNextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

/**
 * 生成测试数据
 */
export function generateTestData(length: number, min = 0, max = 100): number[] {
  return Array.from({ length }, () => Math.random() * (max - min) + min)
}

/**
 * 生成二维测试数据
 */
export function generateTest2DData(length: number): Array<[number, number]> {
  return Array.from({ length }, (_, i) => [i, Math.random() * 100])
}

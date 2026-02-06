/**
 * Vitest 全局 Setup
 * 在所有测试运行前执行
 */

import { beforeAll, afterEach } from "vitest"

// 全局 beforeAll
beforeAll(() => {
  console.log("🚀 启动测试套件...")
})

// 每个测试后清理
afterEach(() => {
  // 清理 DOM
  document.body.innerHTML = ""
})

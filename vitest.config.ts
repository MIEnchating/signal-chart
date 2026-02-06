import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
  test: {
    // 使用 jsdom 环境模拟浏览器
    environment: "happy-dom",

    // 全局 API（describe, it, expect 等）
    globals: true,

    // 覆盖率配置
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "**/*.d.ts", "**/*.config.*", "**/mockData", "tests/"]
    },

    // 测试文件匹配模式
    include: ["tests/**/*.{test,spec}.{js,ts}", "src/**/__tests__/**/*.{test,spec}.{js,ts}"],

    // 排除的文件
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],

    // 测试超时时间
    testTimeout: 10000,

    // 设置文件（全局 setup）
    setupFiles: ["./tests/setup.ts"]
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  }
})

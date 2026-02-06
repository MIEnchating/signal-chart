# 测试指南

## 🧪 测试框架

本项目使用 [Vitest](https://vitest.dev/) 作为测试框架。

## 📂 目录结构

```
tests/
├── setup.ts              # 全局测试设置
├── utils.ts              # 测试工具函数
├── unit/                 # 单元测试
│   ├── utils.test.ts    # 工具函数测试
│   ├── model/           # Model 层测试
│   │   └── GridModel.test.ts
│   └── component/       # Component 层测试
│       └── GridComponent.test.ts
└── integration/         # 集成测试
    └── chart.test.ts    # Chart 完整功能测试
```

## 🚀 运行测试

### 基础命令

```bash
# 运行所有测试（监听模式）
pnpm test

# 运行一次测试
pnpm test:run

# 查看测试 UI 界面
pnpm test:ui

# 生成覆盖率报告
pnpm test:coverage
```

### 运行特定测试

```bash
# 运行单个测试文件
pnpm test tests/unit/utils.test.ts

# 运行匹配模式的测试
pnpm test GridModel

# 运行指定目录的测试
pnpm test tests/unit/
```

## ✍️ 编写测试

### 单元测试示例

```typescript
import { describe, it, expect } from "vitest"
import { linearMap } from "@/utils/math"

describe("linearMap", () => {
  it("应该正确映射数值", () => {
    const result = linearMap(5, [0, 10], [0, 100])
    expect(result).toBe(50)
  })
})
```

### 组件测试示例

```typescript
import { describe, it, expect, beforeEach } from "vitest"
import { GridComponent } from "@/component/GridComponent"
import { createTestContainer, cleanupTestContainer } from "../utils"

describe("GridComponent", () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = createTestContainer()
  })

  afterEach(() => {
    cleanupTestContainer(container)
  })

  it("应该正确渲染", () => {
    // 测试代码
  })
})
```

### 集成测试示例

```typescript
import { describe, it, expect } from "vitest"
import { Chart } from "@/core/chart"

describe("Chart Integration", () => {
  it("应该能创建图表", () => {
    const container = createTestContainer()
    const chart = Chart.init(container)

    expect(chart).toBeDefined()

    chart.dispose()
    cleanupTestContainer(container)
  })
})
```

## 🛠️ 测试工具

### 创建测试容器

```typescript
import { createTestContainer, cleanupTestContainer } from "./utils"

const container = createTestContainer(800, 600)
// ... 测试代码
cleanupTestContainer(container)
```

### 生成测试数据

```typescript
import { generateTestData, generateTest2DData } from "./utils"

const data = generateTestData(100) // [随机数...]
const data2d = generateTest2DData(50) // [[0, rand], [1, rand], ...]
```

### 等待和延迟

```typescript
import { wait, waitForNextFrame } from "./utils"

await wait(100) // 等待 100ms
await waitForNextFrame() // 等待下一帧
```

## 📊 覆盖率

运行覆盖率测试后，报告会生成在 `coverage/` 目录：

```bash
pnpm test:coverage

# 查看报告
open coverage/index.html  # macOS
start coverage/index.html # Windows
```

目标覆盖率：

- **语句覆盖率**: > 80%
- **分支覆盖率**: > 75%
- **函数覆盖率**: > 80%
- **行覆盖率**: > 80%

## 🎯 测试最佳实践

### 1. 命名规范

- 测试文件: `*.test.ts` 或 `*.spec.ts`
- 测试描述: 使用"应该..."开头
- 分组: 使用 `describe` 组织相关测试

```typescript
describe("功能模块", () => {
  describe("子功能", () => {
    it("应该满足某个条件", () => {
      // 测试
    })
  })
})
```

### 2. AAA 模式

```typescript
it("应该正确计算", () => {
  // Arrange - 准备
  const input = 5
  const expected = 10

  // Act - 执行
  const result = calculate(input)

  // Assert - 断言
  expect(result).toBe(expected)
})
```

### 3. Mock 使用

```typescript
import { vi } from "vitest"

const mockFn = vi.fn()
mockFn.mockReturnValue(42)

expect(mockFn()).toBe(42)
expect(mockFn).toHaveBeenCalled()
```

### 4. 清理

```typescript
afterEach(() => {
  // 清理 DOM
  document.body.innerHTML = ""

  // 清理 mock
  vi.clearAllMocks()
})
```

## 🐛 调试测试

### 使用 VS Code

1. 在测试文件中设置断点
2. 按 F5 或点击调试按钮
3. 选择 "Vitest" 配置

### 使用 console.log

```typescript
it("调试测试", () => {
  const result = someFunction()
  console.log("Result:", result) // 输出到控制台
  expect(result).toBeDefined()
})
```

### 使用 test.only

```typescript
// 只运行这个测试
it.only("调试这个", () => {
  // 测试代码
})
```

## 📝 TODO

- [ ] 添加更多单元测试
- [ ] 完善 Model 层测试
- [ ] 添加性能测试
- [ ] 添加快照测试
- [ ] 增加 E2E 测试

## 🔗 相关资源

- [Vitest 官方文档](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

# Signal Chart (信号图表库)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)

**Signal Chart** 是一个基于 [ZRender](https://github.com/ecomfe/zrender) 构建的高性能可视化图表库，专为信号处理、频谱分析和实时数据监控而设计。它采用了现代化的 MVVM 架构，支持灵活的多坐标系布局和高性能的增量渲染。

## ✨ 核心特性

- **🚀 高性能渲染**: 基于 Canvas 的底层绘制，支持脏矩形渲染和层级控制 (`zlevel`/`z`)，适应高频实时数据刷新。
- **🧩 组件化架构**:
  - **Grid**: 支持无限数量的网格布局，通过 `top`/`bottom`/`left`/`right` 灵活定位。
  - **Axis**: 支持多 X 轴、多 Y 轴配置，可任意关联到指定的 Grid。
  - **Series**: 扩展性强的系列设计（频谱图、瀑布图等）。
- **🔄 响应式更新**: 支持 `setOption` 增量更新，智能合并配置，自动计算依赖关系。
- **🛠️ 开发者友好**: 完全 TypeScript 编写，提供完整的类型推导和友好的开发体验。

## 📦 安装

```bash
# 使用 npm
npm install signal-chart

# 使用 pnpm
pnpm add signal-chart
```

## 🚀 快速开始

```typescript
import { Chart } from "signal-chart"
import { GridComponent, XAxisComponent, YAxisComponent } from "signal-chart/dist/components"

// 1. 注册核心组件
Chart.use([GridComponent, XAxisComponent, YAxisComponent])

// 2. 初始化图表实例
const container = document.getElementById("app")
const chart = Chart.init(container, {
  width: 800,
  height: 600,
  renderer: "canvas"
})

// 3. 设置配置项 (支持多 Grid、多 Axis)
chart.setOption({
  backgroundColor: "#1e1e1e",
  // 定义网格区域
  grid: [
    {
      id: "main-grid",
      top: 40,
      height: "40%",
      z: 1 // 层级控制
    },
    {
      id: "sub-grid",
      top: "55%",
      height: "30%",
      z: 1
    }
  ],
  // X 轴配置
  xAxis: [
    {
      gridIndex: 0, // 关联到第一个 grid
      min: 0,
      max: 1000
    },
    {
      gridIndex: 1, // 关联到第二个 grid
      min: 0,
      max: 500,
      position: "top"
    }
  ],
  // Y 轴配置
  yAxis: [
    {
      gridIndex: 0,
      min: -100,
      max: 0
    },
    {
      gridIndex: 1,
      min: 0,
      max: 100
    }
  ]
})

// 4. 动态更新数据
setTimeout(() => {
  chart.setOption({
    yAxis: {
      // 智能合并：仅更新指定属性，其他保持不变
      min: -120
    }
  })
}, 2000)
```

## 📖 配置项手册

### Global Option

| 属性              | 类型                           | 说明         | 默认值 |
| ----------------- | ------------------------------ | ------------ | ------ |
| `backgroundColor` | `string`                       | 背景颜色     | `#000` |
| `grid`            | `GridOption` \| `GridOption[]` | 网格组件配置 | `[]`   |
| `xAxis`           | `AxisOption` \| `AxisOption[]` | X 轴组件配置 | `[]`   |
| `yAxis`           | `AxisOption` \| `AxisOption[]` | Y 轴组件配置 | `[]`   |
| `series`          | `SeriesOption[]`               | 数据系列配置 | `[]`   |

### Grid Option

| 属性            | 类型                 | 说明                            |
| --------------- | -------------------- | ------------------------------- |
| `gridIndex`     | `number`             | 索引 (自动生成)                 |
| `top`, `bottom` | `number` \| `string` | 垂直定位 (像素或百分比)         |
| `left`, `right` | `number` \| `string` | 水平定位 (像素或百分比)         |
| `zlevel`        | `number`             | Canvas 分层层级 (创建新 Canvas) |
| `z`             | `number`             | 同层绘制顺序                    |

### Axis Option

| 属性          | 类型                                     | 说明             |
| ------------- | ---------------------------------------- | ---------------- |
| `gridIndex`   | `number`                                 | 关联的 Grid 索引 |
| `position`    | `'top'`\|`'bottom'`\|`'left'`\|`'right'` | 轴位置           |
| `min`, `max`  | `number`                                 | 数据范围         |
| `splitNumber` | `number`                                 | 期望的分割段数   |
| `axisLine`    | `object`                                 | 轴线样式配置     |
| `axisTick`    | `object`                                 | 刻度样式配置     |
| `axisLabel`   | `object`                                 | 标签样式配置     |

## 🛠️ 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build
```

## 📄 License

MIT

# Signal Chart (信号图表库)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)

**Signal Chart** 是一个基于 [ZRender](https://github.com/ecomfe/zrender) 构建的高性能可视化图表库，专为信号处理、频谱分析和实时数据监控而设计。它采用了现代化的 MVP 架构，支持灵活的多坐标系布局和高性能的实时渲染。

## ✨ 核心特性

- **🚀 高性能渲染**:
  - 双数据路径：配置更新（有 diff）和数据更新（无 diff）分离
  - 对象池复用，避免 GC 压力
  - 批量坐标转换，GPU 加速裁剪
- **🧩 组件化架构**:
  - **Grid**: 支持多网格布局，通过 `top`/`bottom`/`left`/`right` 灵活定位
  - **Axis**: 支持多 X 轴、多 Y 轴配置，可任意关联到指定的 Grid
  - **LineSeries**: 高性能频谱图，支持实时刷新
  - **WaterfallSeries**: 瀑布图，RingBuffer 滚动窗口，D3 颜色映射
  - **VisualMap**: 独立的视觉映射组件，支持颜色映射和色卡显示
- **🔄 智能更新**:
  - 分层 diff，只比较变化的字段
  - 精准通知，只更新受影响的组件
  - 依赖传播，自动处理组件间依赖
- **✨ 智能默认值**:
  - 自动从 series 配置生成 visualMap，无需手动配置
  - 轴配置智能填充，简化用户配置
- **🛠️ 开发者友好**: 完全 TypeScript 编写，提供完整的类型推导

## 📦 安装

```bash
# 使用 pnpm
pnpm add signal-chart

# 使用 npm
npm install signal-chart
```

## 🚀 快速开始

```typescript
import { Chart } from "signal-chart"
import {
  GridComponent,
  XAxisComponent,
  YAxisComponent,
  LineSeriesComponent,
  WaterfallSeriesComponent
} from "signal-chart/dist/components"

// 1. 注册组件
Chart.use([
  GridComponent,
  XAxisComponent,
  YAxisComponent,
  VisualMapComponent,  // 注册 VisualMap 组件
  LineSeriesComponent,
  WaterfallSeriesComponent
])

// 2. 初始化图表
const chart = Chart.init(document.getElementById("app"), {
  width: 800,
  height: 600,
  renderer: "canvas"
})

// 3. 设置配置项（智能默认值）
chart.setOption({
  backgroundColor: "#1e1e1e",
  grid: [
    { top: 40, bottom: "52%", left: 60, right: 100 },   // 频谱图区域
    { top: "52%", bottom: 40, left: 60, right: 100 }    // 瀑布图区域（右边距增大给色卡留空间）
  ],
  xAxis: [
    { gridIndex: 0, min: 0, max: 512 },
    { gridIndex: 1, min: 0, max: 512 }
  ],
  yAxis: [
    { gridIndex: 0, min: -100, max: 0 },
    { gridIndex: 1, min: -100, max: 0 }
  ],
  series: [
    {
      type: "line",
      xAxisIndex: 0,
      yAxisIndex: 0,
      lineStyle: { color: "#00d9ff" }
    },
    {
      type: "waterfall",
      xAxisIndex: 1,
      yAxisIndex: 1,
      colorMap: "turbo",        // 配置颜色映射
      valueRange: [-100, 0],    // 配置数值范围
      maxRows: 100              // visualMap 会自动生成！
    }
  ]
})

// 4. 实时数据更新（高性能路径）
setInterval(() => {
  const spectrumData = getNewSpectrumFrame() // 获取新的频谱数据
  chart.setData(spectrumData)  // 自动分发给所有 series
}, 16) // 60fps
```

## 📖 API

### Chart

| 方法 | 说明 |
|------|------|
| `Chart.init(dom, options)` | 初始化图表实例 |
| `Chart.use(components)` | 注册组件 |
| `chart.setOption(option)` | 设置/更新配置（有 diff） |
| `chart.setData(data)` | 高性能数据更新（无 diff） |
| `chart.resize(opts?)` | 调整图表尺寸 |
| `chart.getOption()` | 获取当前配置 |
| `chart.dispose()` | 销毁图表实例 |

### Series 类型

#### LineSeries（频谱图）

```typescript
{
  type: "line",
  xAxisIndex: 0,
  yAxisIndex: 0,
  lineStyle: { color: "#00d9ff", width: 2 },
  smooth: false
}
```

#### WaterfallSeries（瀑布图）

```typescript
{
  type: "waterfall",
  xAxisIndex: 0,
  yAxisIndex: 0,
  colorMap: "turbo",        // viridis | inferno | plasma | turbo | cool | warm
  valueRange: [-100, 0],    // 颜色映射范围，或 "auto"
  maxRows: 100,             // 滚动窗口大小
  scrollDirection: "down"   // down | up
}
```

## 📖 配置项手册

### Global Option

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `backgroundColor` | `string` | 背景颜色 | `#000` |
| `grid` | `GridOption[]` | 网格组件配置 | `[]` |
| `xAxis` | `XAxisOption[]` | X 轴组件配置 | `[]` |
| `yAxis` | `YAxisOption[]` | Y 轴组件配置 | `[]` |
| `series` | `SeriesOption[]` | 数据系列配置 | `[]` |

### Grid Option

| 属性 | 类型 | 说明 |
|------|------|------|
| `top`, `bottom` | `number \| string` | 垂直定位（像素或百分比） |
| `left`, `right` | `number \| string` | 水平定位（像素或百分比） |
| `zlevel` | `number` | Canvas 分层层级 |
| `z` | `number` | 同层绘制顺序 |

### Axis Option

| 属性 | 类型 | 说明 |
|------|------|------|
| `gridIndex` | `number` | 关联的 Grid 索引 |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | 轴位置 |
| `min`, `max` | `number` | 数据范围 |
| `splitNumber` | `number` | 期望的分割段数 |
| `axisLine` | `object` | 轴线样式配置 |
| `axisTick` | `object` | 刻度样式配置 |
| `axisLabel` | `object` | 标签样式配置 |

## 🛠️ 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查
pnpm type-check

# 运行测试
pnpm test

# 构建
pnpm build
```

## 📄 License

MIT

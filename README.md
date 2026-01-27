# Signal Chart

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Signal Chart** 是一个高性能、专注于信号处理领域的可视化图表库。它基于 [ZRender](https://github.com/ecomfe/zrender) 构建，旨在提供流畅的实时频谱、波形和瀑布图渲染能力。

## ✨ 特性

- **高性能**: 基于 Canvas 渲染，专为高帧率实时信号刷新设计。
- **组件化架构**: 灵活的插件系统，按需加载 Grid、Axis、Series 等组件。
- **MVVM 设计**: Model-View 分离，逻辑清晰，易于扩展。
- **音频专用**: 内置 Hz/dB 单位格式化、对数坐标等音频分析常用功能。

## 📦 安装

```bash
npm install signal-chart
```

## 🚀 快速开始

```typescript
import { Chart } from "signal-chart"
import { GridComponent, XAxisComponent, YAxisComponent } from "signal-chart/components"

// 1. 注册需要的组件
Chart.use([GridComponent, XAxisComponent, YAxisComponent])

// 2. 初始化图表
const dom = document.getElementById("chart-container")
const chart = Chart.init(dom, {
  width: 800,
  height: 600,
  renderer: "canvas"
})

// 3. 设置配置项
chart.setOption({
  backgroundColor: "#1e1e1e",
  grid: {
    top: 60,
    bottom: 60,
    left: 80,
    right: 40
  },
  xAxis: {
    type: "value",
    min: 20,
    max: 20000,
    unit: { show: true, text: "Hz", color: "#fff", fontSize: 12 }
  },
  yAxis: {
    type: "value",
    min: -100,
    max: 0,
    unit: { show: true, text: "dB", color: "#fff", fontSize: 12 }
  }
})
```

## 🛠 开发与贡献

我们需要你的帮助来让 Signal Chart 变得更好！

请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细的项目架构分析、扩展指南以及如何提交 Pull Request。

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-repo/signal-chart.git

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📄 License

MIT

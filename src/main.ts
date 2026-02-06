import { GridComponent } from "@/component/GridComponent"
import { LineSeriesComponent } from "@/component/LineSeriesComponent"
import { WaterfallSeriesComponent } from "@/component/WaterfallSeriesComponent"
import { XAxisComponent } from "@/component/XAxisComponent"
import { YAxisComponent } from "@/component/YAxisComponent"
import { VisualMapComponent } from "@/component/VisualMapComponent"
import { Chart } from "@/core/chart"

// 注册全局组件
Chart.use([
  GridComponent,
  XAxisComponent,
  YAxisComponent,
  VisualMapComponent,
  LineSeriesComponent,
  WaterfallSeriesComponent
])

// 获取容器
const app = document.querySelector<HTMLDivElement>(".app")!

// 创建图表实例
const chart = Chart.init(app, {
  width: 800,
  height: 600,
  renderer: "canvas"
})

// 设置初始配置
chart.setOption({
  grid: [
    { top: 40, bottom: "52%", left: 60, right: 100 },
    { top: "52%", bottom: 40, left: 60, right: 100 }
  ],
  xAxis: [
    { gridIndex: 0, min: 0, max: 512 },
    { gridIndex: 1, min: 0, max: 512 }
  ],
  yAxis: [
    {
      gridIndex: 0,
      min: -100,
      max: 0,
      unit: { show: true, text: "dB", color: "#ccc", fontSize: 10 }
    },
    {
      gridIndex: 1,
      min: -100,
      max: 0,
      unit: { show: true, text: "dB", color: "#ccc", fontSize: 10 }
    }
  ],
  series: [
    {
      id: "spectrum",
      type: "line",
      name: "频谱",
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: [],
      lineStyle: { color: "#00d9ff" }
    },
    {
      id: "waterfall",
      type: "waterfall",
      name: "瀑布图",
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: [],
      colorMap: "turbo",
      valueRange: [-100, 0],
      maxRows: 100,
      scrollDirection: "down"
    }
  ]
})

console.log("实例:", Chart.getInstanceByDom(app))
console.log("当前配置:", chart.getOption())

/**
 * 生成模拟频谱数据
 */
function generateSpectrumData(length: number, time: number): number[] {
  const data: number[] = []
  for (let i = 0; i < length; i++) {
    const noise = Math.random() * 10 - 5
    const peak1 = Math.exp(-Math.pow((i - 100 + Math.sin(time * 0.5) * 20) / 30, 2)) * 40
    const peak2 = Math.exp(-Math.pow((i - 300 + Math.cos(time * 0.3) * 30) / 50, 2)) * 30
    const peak3 = Math.exp(-Math.pow((i - 450) / 20, 2)) * 25

    data.push(-80 + noise + peak1 + peak2 + peak3)
  }
  return data
}

// 实时更新频谱图和瀑布图
let frameCount = 0
function updateFrame() {
  frameCount++
  const time = frameCount * 0.1

  // 生成新的频谱数据
  const spectrumData = generateSpectrumData(512, time)

  // 统一数据更新：自动分发给所有 series
  chart.setData(spectrumData)

  requestAnimationFrame(updateFrame)
}

// 启动动画循环
requestAnimationFrame(updateFrame)

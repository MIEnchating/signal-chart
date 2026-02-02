import { GridComponent } from "@/component/GridComponent"
import { LineSeriesComponent } from "@/component/LineSeriesComponent"
import { XAxisComponent } from "@/component/XAxisComponent"
import { YAxisComponent } from "@/component/YAxisComponent"
import { Chart } from "@/core/chart"

// 注册全局组件
Chart.use([GridComponent, XAxisComponent, YAxisComponent, LineSeriesComponent])

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
  xAxis: {
    min: 0,
    max: 10
  },
  yAxis: {
    min: 0,
    max: 100
  },
  series: [
    {
      type: "line",
      name: "频谱波形",
      data: [0, 100, 50, 75, 20, 90, 30, 60, 10, 80, 40],

      lineStyle: {
        color: "#ff6347"
      }
    }
  ]
})

console.log("实例:", Chart.getInstanceByDom(app))
console.log("当前配置:", chart.getOption())

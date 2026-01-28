import { GridComponent } from "@/component/GridComponent"
import { XAxisComponent } from "@/component/XAxisComponent"
import { YAxisComponent } from "@/component/YAxisComponent"
import { Chart } from "@/core/chart"

// 注册全局组件
Chart.use([GridComponent, XAxisComponent, YAxisComponent])

// 获取容器
const app = document.querySelector<HTMLDivElement>(".app")!

// 创建图表实例
const chart = Chart.init(app, {
  width: 800,
  height: 600,
  renderer: "canvas"
})

// 设置配置项
chart.setOption({})

setTimeout(() => {
  chart.setOption({
    yAxis: {
      min: 20,
      max: 120
    }
  })
}, 2000)

console.log("实例:", Chart.getInstanceByDom(app))
console.log("当前配置:", chart.getOption())

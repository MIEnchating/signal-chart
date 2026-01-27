import { GridComponent } from "@/component/gridComponent"
import { XAxisComponent } from "@/component/xAxisComponent"
import { YAxisComponent } from "@/component/yAxisComponent"
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
chart.setOption({
  backgroundColor: "#1e1e1e",
  grid: {
    top: 60,
    bottom: 60,
    left: 80,
    right: 40
  },
  xAxis: {
    show: true,
    type: "value",
    min: 30,
    max: 100,
    position: "bottom",
    splitNumber: 10,
    axisLine: {
      show: true,
      color: "#4a90e2"
    },
    axisTick: {
      show: true,
      length: 6,
      color: "#4a90e2",
      splitNumber: 5
    },
    axisLabel: {
      show: true,
      color: "#fff",
      fontSize: 12
    },
    unit: {
      show: true,
      text: "Hz",
      color: "#fff",
      fontSize: 12
    }
  },
  yAxis: {
    show: true,
    type: "value",
    min: -80,
    max: 0,
    position: "left",
    splitNumber: 8,
    axisLine: {
      show: true,
      color: "#4a90e2"
    },
    axisTick: {
      show: true,
      length: 6,
      color: "#4a90e2",
      splitNumber: 5
    },
    axisLabel: {
      show: true,
      color: "#fff",
      fontSize: 12
    },
    unit: {
      show: true,
      text: "dB",
      color: "#fff",
      fontSize: 12
    }
  }
})

setTimeout(() => {
  chart.setOption({
    grid: {
      top: 200
    },
    yAxis: {
      min: 20,
      max: 120
    }
  })
}, 2000)

console.log("Chart initialized:", chart)
console.log("Current option:", chart.getOption())

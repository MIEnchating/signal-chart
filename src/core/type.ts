import { ComponentContext, ComponentSpec } from "@/component/component"

// 图表类型(频谱图、瀑布图等)
type SeriesType = "spectrum" | "waterfall"
// 网格配置接口
export interface GridOption {
  top: number | string
  bottom: number | string
  left: number | string
  right: number | string
}

// 轴配置接口
export interface AxisOption {
  show: boolean
  type: "value" | "time"
  min: number | "dataMin"
  max: number | "dataMax"
  // 轴位置
  position: "top" | "bottom" | "left" | "right"
  // 刻度分割段数
  splitNumber: number
  // 轴线
  axisLine: {
    show: boolean
    color: string
  }
  // 刻度
  axisTick: {
    show: boolean
    length: number
    color: string
    // 小刻度数量
    splitNumber: number
  }
  // 标签
  axisLabel: {
    show: boolean
    color: string
    fontSize: number
  }
  // 单位
  unit?: {
    show: boolean
    text: string
    color: string
    fontSize: number
  }
}

// 图表配置项
export interface SeriesOption {
  id?: string
  name: string
  // 图表类型
  type: SeriesType
  show: boolean
  data: number[]
}

export interface ChartOption {
  backgroundColor: string
  grid: GridOption
  xAxis: AxisOption | AxisOption[]
  yAxis: AxisOption | AxisOption[]
  series?: SeriesOption[]
}

export interface Opts {
  //  可显式指定实例宽度，单位为像素。如果传入值为null/undefined/'auto'，则表示自动取 dom（实例容器）的宽度。
  width?: number | string
  // 可显式指定实例高度，单位为像素。如果传入值为null/undefined/'auto'，则表示自动取 dom（实例容器）的高度。
  height?: number | string
  // 设备像素比，默认取浏览器的 window.devicePixelRatio
  devicePixelRatio?: number
  // 渲染器选择，默认使用 'canvas'，可选 'canvas' 或 'svg'
  renderer?: "canvas" | "svg"
  // 是否开启脏矩形渲染，只有在 Canvas 渲染模式有效，默认为false
  useDirtyRect?: boolean
  //是否扩大可点击元素的响应范围。null 表示对移动设备开启；true 表示总是开启；false 表示总是不开启。
  useCoarsePointer?: boolean | null
  //扩大元素响应范围的像素大小，配合 opts.useCoarsePointer使用。
  pointerSize?: number
}

export type ComponentConstructor = new (context: ComponentContext) => ComponentSpec

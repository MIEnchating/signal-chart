/**
 * 核心类型定义
 *
 * 包含图表的基础配置和选项类型
 */

/**
 * ZRender 初始化选项
 */
export interface ZRenderInitOptions {
  /** 可显式指定实例宽度，单位为像素。如果传入值为 null/undefined/'auto'，则表示自动取 dom（实例容器）的宽度 */
  width?: number | string
  /** 可显式指定实例高度，单位为像素。如果传入值为 null/undefined/'auto'，则表示自动取 dom（实例容器）的高度 */
  height?: number | string
  /** 设备像素比，默认取浏览器的 window.devicePixelRatio */
  devicePixelRatio?: number
  /** 渲染器选择，默认使用 'canvas'，可选 'canvas' 或 'svg' */
  renderer?: "canvas" | "svg"
  /** 是否开启脏矩形渲染，只有在 Canvas 渲染模式有效，默认为 false */
  useDirtyRect?: boolean
  /** 是否扩大可点击元素的响应范围。null 表示对移动设备开启；true 表示总是开启；false 表示总是不开启 */
  useCoarsePointer?: boolean | null
  /** 扩大元素响应范围的像素大小，配合 opts.useCoarsePointer 使用 */
  pointerSize?: number
}

/**
 * 用户输入的图表配置接口（部分字段可选）
 */
export interface InputChartOption {
  color?: string[]
  /** 背景色 */
  backgroundColor?: string
  /** 网格配置（单个或数组） */
  grid?: Partial<GridOption> | Partial<GridOption>[]
  /** X 轴配置（单个或数组） */
  xAxis?: Partial<XAxisOption> | Partial<XAxisOption>[]
  /** Y 轴配置（单个或数组） */
  yAxis?: Partial<YAxisOption> | Partial<YAxisOption>[]
  /** 系列配置 */
  series?: SeriesOption[]
}

/**
 * 规范化后的图表配置接口（所有字段必需，轴配置统一为数组）
 */
export interface ChartOption {
  color: string[]
  /** 背景色 */
  backgroundColor: string
  /** 网格配置数组 */
  grid: GridOption[]
  /** X 轴配置数组 */
  xAxis: XAxisOption[]
  /** Y 轴配置数组 */
  yAxis: YAxisOption[]
  /** 系列配置 */
  series: SeriesOption[]
}

/**
 * 坐标查找器（用于 convertToPixel / convertFromPixel / containPixel）
 */
export interface CoordinateFinder {
  xAxisIndex?: number
  xAxisId?: string
  yAxisIndex?: number
  yAxisId?: string
  gridIndex?: number
  gridId?: string
}

interface BaseOption {
  // 组件 ID。默认不指定。指定则可用于在 option 或者 API 中引用组件。
  id?: string
  // 分层（会新建画布）
  zlevel?: number
  // 层叠（同一画布内的图形层叠顺序）
  z?: number
}

/**
 * 网格配置接口
 */
export interface GridOption extends BaseOption {
  /** 上边距 */
  top: number | string
  /** 下边距 */
  bottom: number | string
  /** 左边距 */
  left: number | string
  /** 右边距 */
  right: number | string
}

/**
 * 轴配置基础接口
 */
interface BaseAxisOption extends BaseOption {
  gridIndex: number
  /** 是否显示 */
  show: boolean
  /** 轴类型 */
  type: "value" | "time"
  /** 最小值 */
  min: number | "dataMin"
  /** 最大值 */
  max: number | "dataMax"
  /** 刻度分割段数 */
  splitNumber: number
  /** 轴线配置 */
  axisLine: AxisLineOption
  /** 刻度配置 */
  axisTick: AxisTickOption
  /** 标签配置 */
  axisLabel: AxisLabelOption
  /** 单位配置 */
  unit?: AxisUnitOption
}

/**
 * X 轴配置接口（位置只能是上下）
 */
export interface XAxisOption extends BaseAxisOption {
  /** 轴位置：上或下 */
  position: "top" | "bottom"
}

/**
 * Y 轴配置接口（位置只能是左右）
 */
export interface YAxisOption extends BaseAxisOption {
  /** 轴位置：左或右 */
  position: "left" | "right"
}

/**
 * 通用轴配置接口（向后兼容）
 */
export type AxisOption = XAxisOption | YAxisOption

/**
 * 轴线配置
 */
export interface AxisLineOption {
  show: boolean
  color: string
}

/**
 * 刻度配置
 */
export interface AxisTickOption {
  show: boolean
  length: number
  color: string
  /** 小刻度数量 */
  splitNumber: number
}

/**
 * 轴标签配置
 */
export interface AxisLabelOption {
  show: boolean
  color: string
  fontSize: number
}

/**
 * 轴单位配置
 */
export interface AxisUnitOption {
  show: boolean
  text: string
  color: string
  fontSize: number
}

/**
 * 系列类型
 */
export type SeriesType = "line" | "spectrum" | "waterfall"

/**
 * 系列配置接口
 */
export interface SeriesOption {
  id?: string
  name?: string
  /** 图表类型 */
  type: SeriesType
  show?: boolean
  data: Array<number | [number, number]>
  xAxisIndex?: number
  yAxisIndex?: number
  lineStyle?: LineStyleOption
  smooth?: boolean
  zlevel?: number
  z?: number
}

/**
 * 线条样式
 */
export interface LineStyleOption {
  color?: string
  width?: number
}

/**
 * Line Series 配置
 */
export interface LineSeriesOption extends SeriesOption {
  type: "line"
}

/**
 * Line Series 渲染数据
 */
export interface LineSeriesRenderItem {
  id?: string
  name?: string
  show: boolean
  points: Array<[number, number]>
  lineStyle: { color: string; width: number }
  smooth: boolean
  zlevel?: number
  z?: number
}

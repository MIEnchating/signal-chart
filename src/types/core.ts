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
  /** 背景色 */
  backgroundColor?: string
  /** 网格配置（单个或数组） */
  grid?: Partial<GridOption> | Partial<GridOption>[]
  /** X 轴配置（单个或数组） */
  xAxis?: Partial<XAxisOption> | Partial<XAxisOption>[]
  /** Y 轴配置（单个或数组） */
  yAxis?: Partial<YAxisOption> | Partial<YAxisOption>[]
  /** 视觉映射配置（单个或数组） */
  visualMap?: Partial<VisualMapOption> | Partial<VisualMapOption>[]
  /** 提示框配置 */
  tooltip?: Partial<TooltipOption>
  /** 系列配置 */
  series?: (SeriesOption | WaterfallSeriesOption)[]
}

/**
 * 规范化后的图表配置接口（所有字段必需，轴配置统一为数组）
 */
export interface ChartOption {
  /** 背景色 */
  backgroundColor: string
  /** 网格配置数组 */
  grid: GridOption[]
  /** X 轴配置数组 */
  xAxis: XAxisOption[]
  /** Y 轴配置数组 */
  yAxis: YAxisOption[]
  /** 视觉映射配置数组 */
  visualMap: VisualMapOption[]
  /** 提示框配置 */
  tooltip: TooltipOption
  /** 系列配置 */
  series: (SeriesOption | WaterfallSeriesOption)[]
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

/**
 * 单轴坐标变换参数
 */
export interface AxisTransformParams {
  /** 数据范围 [min, max] */
  domain: [number, number]
  /** 像素范围 [min, max] */
  pixelRange: [number, number]
}

/**
 * XY 坐标变换参数（用于批量坐标转换）
 */
export interface CoordinateTransform {
  x: AxisTransformParams | null
  y: AxisTransformParams | null
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
  /** 分割线配置 */
  splitLine: SplitLineOption
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
 * 分割线配置
 */
export interface SplitLineOption {
  show: boolean
  lineStyle: {
    color: string
    width: number
    type?: "solid" | "dashed" | "dotted"
  }
}

/**
 * Tooltip 配置
 */
export interface TooltipOption {
  /** 是否显示 */
  show: boolean
  /** 触发类型 */
  trigger: "axis" | "item" | "none"
  /** 坐标轴指示器配置 */
  axisPointer?: {
    type: "line" | "shadow" | "cross" | "none"
    lineStyle?: {
      color: string
      width: number
      type?: "solid" | "dashed" | "dotted"
    }
  }
  /** 提示框样式 */
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  textStyle?: {
    color: string
    fontSize: number
  }
  /** 内边距 */
  padding?: number
  /** 格式化函数（暂不支持，预留） */
  formatter?: string
}

/**
 * 系列类型
 */
export type SeriesType = "line" | "spectrum" | "waterfall"

/**
 * 系列数据项类型
 */
export type SeriesDataItem = number | [number, number]

/**
 * 系列配置接口
 */
export interface SeriesOption {
  id?: string
  name?: string
  /** 图表类型 */
  type: SeriesType
  show?: boolean
  data: SeriesDataItem[]
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

/**
 * Waterfall Series 配置
 *
 * 智能默认值功能：
 * - 如果配置了 colorMap 和 valueRange，系统会自动生成对应的 visualMap
 * - 无需手动配置 visualMap，简化使用流程
 * - 如果需要自定义 visualMap，可以显式配置（优先级更高）
 */
export interface WaterfallSeriesOption extends Omit<SeriesOption, "data"> {
  type: "waterfall"
  /** 瀑布图数据：每一行是一个时间帧的频谱数据 */
  data: number[][]
  /** 颜色映射方案（配置后会自动生成 visualMap） */
  colorMap?: "viridis" | "inferno" | "plasma" | "turbo" | "cool" | "warm"
  /** 最大显示行数（滚动窗口大小） */
  maxRows?: number
  /** 滚动方向：从上到下或从下到上 */
  scrollDirection?: "down" | "up"
  /** 数值范围（用于颜色映射，配置后会自动生成 visualMap）*/
  valueRange?: [number, number] | "auto"
}

/**
 * Waterfall Series 渲染数据
 */
export interface WaterfallSeriesRenderItem {
  id?: string
  name?: string
  show: boolean
  /** 二维数据矩阵 */
  matrix: number[][]
  /** 颜色映射配置 */
  colorMap: "viridis" | "inferno" | "plasma" | "turbo" | "cool" | "warm"
  /** 数值域（用于颜色映射）*/
  valueRange: [number, number]
  /** 渲染区域 */
  rect: { x: number; y: number; width: number; height: number }
  zlevel?: number
  z?: number
}

/**
 * 视觉映射组件配置（类似 ECharts 的 visualMap）
 */
export interface VisualMapOption extends BaseOption {
  /** 是否显示 */
  show: boolean
  /** 类型：连续型 */
  type: "continuous"
  /** 最小值 */
  min: number
  /** 最大值 */
  max: number
  /** 颜色映射方案（字符串为内置方案，数组为自定义颜色） */
  colorMap: "viridis" | "inferno" | "plasma" | "turbo" | "cool" | "warm" | string[]
  /** 关联的 series 索引（可以关联多个） */
  seriesIndex?: number | number[]
  /** 方向：垂直或水平 */
  orient: "vertical" | "horizontal"
  /** 水平位置 */
  left?: number | string
  /** 垂直位置 */
  top?: number | string
  /** 右侧位置 */
  right?: number | string
  /** 底部位置 */
  bottom?: number | string
  /** 色卡宽度（垂直时）或高度（水平时） */
  itemWidth: number
  /** 色卡高度（垂直时）或宽度（水平时） */
  itemHeight: number
  /** 刻度数量 */
  splitNumber: number
  /** 文本样式 */
  textStyle: {
    color: string
    fontSize: number
  }
  /** 单位文本 */
  unit?: {
    show: boolean
    text: string
    color: string
    fontSize: number
  }
  /**
   * 是否包含标签在内（默认 true）
   * - true: 自动计算标签宽度并调整位置，确保标签不超出容器
   * - false: 不考虑标签宽度，可能导致标签超出
   */
  containLabel?: boolean
}

/**
 * VisualMap 渲染数据
 */
export interface VisualMapRenderItem {
  id?: string
  show: boolean
  /** 颜色映射方案（字符串为内置方案，数组为自定义颜色） */
  colorMap: "viridis" | "inferno" | "plasma" | "turbo" | "cool" | "warm" | string[]
  /** 数值范围 */
  valueRange: [number, number]
  /** 渲染位置 */
  rect: { x: number; y: number; width: number; height: number }
  /** 方向 */
  orient: "vertical" | "horizontal"
  /** 刻度数量 */
  splitNumber: number
  /** 文本样式 */
  textStyle: {
    color: string
    fontSize: number
  }
  /** 单位配置 */
  unit?: {
    show: boolean
    text: string
    color: string
    fontSize: number
  }
  zlevel?: number
  z?: number
}


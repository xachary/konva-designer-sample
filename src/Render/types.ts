import Konva from 'konva'
import { Render } from './index'

export type ValueOf<T> = T[keyof T]

export interface RenderConfig {
  width: number
  height: number
  //
  showBg?: boolean
  showRuler?: boolean
  showRefLine?: boolean
  showPreview?: boolean
  attractResize?: boolean
  attractBg?: boolean
  attractNode?: boolean
}

export type RenderEvents = {
  ['history-change']: { records: string[]; index: number }
  ['selection-change']: Konva.Node[]
  ['debug-change']: boolean
  ['link-type-change']: LinkType
  ['scale-change']: number
  ['loading']: boolean
  ['graph-type-change']: GraphType | undefined
  //
  ['page-settings-change']: PageSettings
  ['link-selection-change']: Konva.Line | undefined
}

export interface Handler {
  handlers?: {
    stage?: {
      [index: string]: (e?: any) => void
    }
    dom?: {
      [index: string]: (e?: any) => void
    }
    transformer?: {
      [index: string]: (e?: any) => void
    }
  }
  transformerConfig?: {
    anchorDragBoundFunc?: (
      oldPos: Konva.Vector2d,
      newPos: Konva.Vector2d,
      e: MouseEvent
    ) => Konva.Vector2d
    dragBoundFunc?: (newPos: Konva.Vector2d, e: MouseEvent) => Konva.Vector2d
  }
}

export enum MouseButton {
  左键 = 0,
  右键 = 2
}

export interface Draw {
  readonly layer: Konva.Layer

  option: {
    [index: string]: any
  }
  init: () => void
  draw: () => void
  clear: () => void
}

export class BaseDraw {
  protected render: Render
  readonly layer: Konva.Layer
  protected group: Konva.Group

  constructor(render: Render, layer: Konva.Layer) {
    this.render = render
    this.layer = layer

    this.group = new Konva.Group()
  }

  init() {
    this.layer.add(this.group)
    this.draw()
  }

  draw() {}

  clear() {
    // 重置
    this.group.destroy()
    //
    const name = this.group.name()
    this.group = new Konva.Group({ name })
    this.layer.add(this.group)
  }
}

export { Render }

export interface AssetInfoPoint {
  x: number
  y: number
  direction?: 'top' | 'bottom' | 'left' | 'right' // 人为定义连接点属于元素的什么方向
  alias?: string
}

export interface AssetInfo {
  url: string
  avatar?: string // 子素材需要额外的封面
  points?: Array<AssetInfoPoint>
}

export enum MoveKey {
  上 = 'ArrowUp',
  左 = 'ArrowLeft',
  右 = 'ArrowRight',
  下 = 'ArrowDown'
}

export enum ShutcutKey {
  删除 = 'Delete',
  C = 'KeyC',
  V = 'KeyV',
  Z = 'KeyZ',
  A = 'KeyA',
  R = 'KeyR',
  Esc = 'Escape',
  Backspace = 'Backspace'
}

export enum AlignType {
  垂直居中 = 'Middle',
  左对齐 = 'Left',
  右对齐 = 'Right',
  水平居中 = 'Center',
  上对齐 = 'Top',
  下对齐 = 'Bottom'
}

// 连接线 类型
export enum LinkType {
  'auto' = 'auto',
  'straight' = 'straight', // 直线
  'manual' = 'manual' // 手动折线
}

/**
 * 连接对
 */
export interface LinkDrawPair {
  id: string
  from: {
    groupId: string
    pointId: string
    rawGroupId?: string // 预留
  }
  to: {
    groupId: string
    pointId: string
    rawGroupId?: string // 预留
  }
  disabled?: boolean // 标记为 true，算法会忽略该 pair 的画线逻辑
  linkType?: LinkType // 连接线类型
  style?: Konva.LineConfig
}

/**
 * 连接点
 */
export interface LinkDrawPoint {
  id: string
  groupId: string
  rawGroupId?: string // 预留
  visible: boolean
  pairs: LinkDrawPair[]
  x: number
  y: number
  direction?: 'top' | 'bottom' | 'left' | 'right' // 人为定义连接点属于元素的什么方向
  alias?: string
}

/**
 * 连接线 拐点
 */
export interface ManualPoint {
  x: number
  y: number
}

/**
 * 连接线 拐点 表
 */
export interface ManualPointsMap {
  [index: string]: ManualPoint[]
}

/**
 * 直线、折线 拐点
 */
export interface LineManualPoint {
  x: number
  y: number
  index: number
}

/**
 * 图形类型
 */
export enum GraphType {
  Line = 'Line', // 直线
  Curve = 'Curve', // 曲线
  Rect = 'Rect', // 矩形
  Circle = 'Circle' // 圆/椭圆形
}

/**
 * 图形 的 调整点 信息
 */
export interface GraphAnchor {
  type?: GraphType
  adjustType: string
  //
  name?: string
  groupId?: string
  //
  adjusted?: boolean
}

/**
 * 图形 的 调整点 图形、锚点关系
 */
export interface GraphAnchorShape {
  shape: Konva.Shape
  anchorShadow: Konva.Circle
}

/**
 * 素材类型
 */
export enum AssetType {
  'Image' = 'Image',
  'Json' = 'Json',
  'Graph' = 'Graph'
}

/**
 * 图片类型
 */
export enum ImageType {
  'svg' = 'svg',
  'gif' = 'gif',
  'other' = 'other'
}

/**
 * 对齐信息
 */
export interface SortItem {
  id?: number // 有 id 就是其他节点，否则就是 选择目标
  value: number // 左、垂直中、右的 x 坐标值; 上、水平中、下的 y 坐标值；
}

/**
 * 页面设置
 */
export interface PageSettings {
  background: string
  stroke: string
  fill: string
  linkStroke: string
  linkStrokeWidth: number
}

/**
 * 素材设置
 */
export interface AssetSettings {
  stroke: string
  fill: string
  arrowStart: boolean
  arrowEnd: boolean
}

/**
 * 连接线设置
 */
export interface LinkSettings {
  stroke: string
  strokeWidth: number
}

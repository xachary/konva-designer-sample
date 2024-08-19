import Konva from 'konva'
import { Render } from './index'
import { nanoid } from 'nanoid'
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

export enum LinkType {
  'auto' = 'auto',
  'straight' = 'straight', // 直线
  'manual' = 'manual' // 手动折线
}

// 连接对
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
}

// 连接点
export interface LinkDrawPoint {
  id: string
  groupId: string
  rawGroupId?: string // 预留
  visible: boolean
  pairs: LinkDrawPair[]
  x: number
  y: number
  direction?: 'top' | 'bottom' | 'left' | 'right' // 人为定义连接点属于元素的什么方向
}

export interface ManualPoint {
  x: number
  y: number
}

export interface ManualPointsMap {
  [index: string]: ManualPoint[]
}

/**
 * 图形类
 * 实例主要用于新建图形时，含新建同时的大小拖动。
 * 静态方法主要用于新建之后，通过 调整点 调整的逻辑定义
 */
export abstract class BaseGraph {
  /**
   * 更新 图形 的 调整点 的 锚点位置
   * @param width 图形 的 宽度
   * @param height 图形 的 高度
   * @param rotate 图形 的 旋转角度
   * @param anchorShadows 图形 的 调整点 的 锚点
   */
  static updateAnchorShadows(
    width: number,
    height: number,
    rotate: number,
    anchorShadows: Konva.Circle[]
  ) {
    console.log('请实现 updateAnchorShadows', width, height, anchorShadows)
  }

  /**
   * 生成 调整点
   * @param render 渲染实例
   * @param graph 图形
   * @param anchor 调整点 定义
   * @param anchorShadow 调整点 锚点
   * @param adjustingId 正在操作的 调整点 id
   * @returns
   */
  static createAnchorShape(
    render: Render,
    graph: Konva.Group,
    anchor: GraphAnchor,
    anchorShadow: Konva.Circle
  ): Konva.Shape {
    console.log('请实现 createAnchorShape', render, graph, anchor, anchorShadow)
    return new Konva.Shape()
  }

  /**
   * 调整 图形
   * @param render 渲染实例
   * @param graph 图形
   * @param graphSnap 图形 的 备份
   * @param rect 当前 调整点
   * @param rects 所有 调整点
   * @param startPoint 鼠标按下位置
   * @param endPoint 鼠标拖动位置
   */
  static adjust(
    render: Render,
    graph: Konva.Group,
    graphSnap: Konva.Group,
    rect: GraphAnchorShape,
    rects: GraphAnchorShape[],
    startPoint: Konva.Vector2d,
    endPoint: Konva.Vector2d
  ) {
    console.log('请实现 updateAnchorShadows', render, graph, rect, startPoint, endPoint)
  }
  //
  protected render: Render
  group: Konva.Group
  id: string // 就是 group 的id
  /**
   * 鼠标按下位置
   */
  protected dropPoint: Konva.Vector2d = { x: 0, y: 0 }
  /**
   * 调整点 定义
   */
  protected anchors: GraphAnchor[] = []
  /**
   * 调整点 的 锚点
   */
  protected anchorShadows: Konva.Circle[] = []

  constructor(
    render: Render,
    dropPoint: Konva.Vector2d,
    config: {
      anchors: GraphAnchor[]
    }
  ) {
    this.render = render
    this.dropPoint = dropPoint

    this.id = nanoid()

    this.group = new Konva.Group({
      id: this.id,
      name: 'asset',
      assetType: AssetType.Graph
    })

    this.anchors = config.anchors.map((o) => ({
      ...o,
      // 补充信息
      name: 'anchor',
      groupId: this.group.id()
    }))

    // 记录在 group 中
    this.group.setAttr('anchors', config.anchors)

    // 新建 调整点 的 锚点
    for (const anchor of this.anchors) {
      const circle = new Konva.Circle({
        id: anchor.id,
        name: anchor.name,
        radius: 0
        // radius: this.render.toStageValue(1),
        // fill: 'red'
      })
      this.anchorShadows.push(circle)
      this.group.add(circle)
    }

    this.render.layer.add(this.group)

    this.render.redraw()
  }

  /**
   * 调整进行时
   * @param point 鼠标位置 相对位置
   */
  abstract drawMove(point: Konva.Vector2d): void

  /**
   * 调整结束
   */
  abstract drawEnd(): void
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
  id: string
  type: GraphType
  //
  name?: string
  groupId?: string
}

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

export interface SortItem {
  id?: number // 有 id 就是其他节点，否则就是 选择目标
  value: number // 左、垂直中、右的 x 坐标值; 上、水平中、下的 y 坐标值；
}

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
  //
  on?: {
    historyChange?: (history: string[], historyIndex: number) => void
    selectionChange?: (selection: Konva.Node[]) => void
    debugChange?: (v: boolean) => void
    linkTypeChange?: (type: LinkType) => void
  }
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
    const name = this.group.name()
    this.group.destroy()
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

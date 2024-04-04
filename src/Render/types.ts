import Konva from 'konva'

export type ValueOf<T> = T[keyof T]

export interface RenderConfig {
  width: number
  height: number
  //
  showBg?: boolean
  showRuler?: boolean
  //
}

export interface Handler {
  handlers?: {
    stage?: {
      [index: string]: (e?: any) => void
    }
    dom?: {
      [index: string]: (e?: any) => void
    }
  }
}

export enum MouseButton {
  左键 = 0,
  右键 = 2
}

export interface Draw {
  layer: Konva.Layer
  config: RenderConfig
  init: () => void
  draw: () => void
  clear: () => void
  state: {
    [index: string]: any
  }
  on: {
    [index: string]: (e?: any) => any
  }
}

export class BaseDraw {
  protected stage: Konva.Stage
  readonly layer: Konva.Layer
  readonly config: RenderConfig
  readonly group: Konva.Group

  constructor(stage: Konva.Stage, config: RenderConfig, layer: Konva.Layer) {
    this.stage = stage
    this.config = config
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
    this.group.removeChildren()
  }
}

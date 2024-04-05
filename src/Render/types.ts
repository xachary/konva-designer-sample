import Konva from 'konva'
import { Render } from './index'

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
  readonly group: Konva.Group

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
    this.group.removeChildren()
  }
}

export { Render }

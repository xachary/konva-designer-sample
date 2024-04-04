import Konva from 'konva'
//
import { Render } from '../index'
import * as Types from '../types'
//
import * as Draws from '../draws'

export class DragHandlers implements Types.Handler {
  static readonly name = 'Drag'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  mousedownRight = false
  mousedownPosition = { x: 0, y: 0 }
  mousedownPointerPosition = { x: 0, y: 0 }

  handlers = {
    stage: {
      mousedown: (e: Konva.KonvaEventObject<GlobalEventHandlersEventMap['mousedown']>) => {
        if (e.evt.button === Types.MouseButton.右键) {
          // 鼠标右键
          this.mousedownRight = true

          this.mousedownPosition = { x: this.render.stage.x(), y: this.render.stage.y() }
          const pos = this.render.stage.getPointerPosition()
          if (pos) {
            this.mousedownPointerPosition = { x: pos.x, y: pos.y }
          }

          document.body.style.cursor = 'pointer'
        }
      },
      mouseup: () => {
        this.mousedownRight = false

        document.body.style.cursor = 'default'
      },
      mousemove: () => {
        if (this.mousedownRight) {
          // 鼠标右键拖动
          const pos = this.render.stage.getPointerPosition()
          if (pos) {
            const offsetX = pos.x - this.mousedownPointerPosition.x
            const offsetY = pos.y - this.mousedownPointerPosition.y
            this.render.stage.position({
              x: this.mousedownPosition.x + offsetX,
              y: this.mousedownPosition.y + offsetY
            })

            // 更新背景
            this.render.draws[Draws.BgDraw.name].draw()
            // 更新比例尺
            this.render.draws[Draws.RulerDraw.name].draw()
          }
        }
      }
    }
  }
}

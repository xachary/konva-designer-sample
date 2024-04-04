import Konva from 'konva'
//
import { Render } from '../index'
import * as Types from '../types'
//
import * as Draws from '../draws'

export class ZoomHandlers implements Types.Handler {
  static readonly name = 'Zoom'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  // zoom 速度
  scaleBy = 0.1
  scaleMin = 0.5
  scaleMax = 5

  handlers = {
    stage: {
      wheel: (e: Konva.KonvaEventObject<GlobalEventHandlersEventMap['wheel']>) => {
        const oldScale = this.render.stage.scaleX()

        const pos = this.render.stage.getPointerPosition()
        if (pos) {
          const mousePointTo = {
            x: (pos.x - this.render.stage.x()) / oldScale,
            y: (pos.y - this.render.stage.y()) / oldScale
          }

          const direction = e.evt.deltaY > 0 ? 1 : -1

          const newScale = direction > 0 ? oldScale + this.scaleBy : oldScale - this.scaleBy

          if (newScale >= this.scaleMin && newScale < this.scaleMax) {
            this.render.stage.scale({ x: newScale, y: newScale })

            this.render.stage.position({
              x: pos.x - mousePointTo.x * newScale,
              y: pos.y - mousePointTo.y * newScale
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

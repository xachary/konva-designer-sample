import _ from 'lodash-es'
//
import { Render } from '../index'
import * as Types from '../types'
//
import * as Draws from '../draws'

export class LinkHandlers implements Types.Handler {
  static readonly name = 'Link'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  handlers = {
    stage: {
      mouseup: () => {
        const linkDrawState = (this.render.draws[Draws.LinkDraw.name] as Draws.LinkDraw).state

        // 临时 连接线 移除
        linkDrawState.linkingLine?.line.remove()
        linkDrawState.linkingLine = null
      },
      mousemove: () => {
        const linkDrawState = (this.render.draws[Draws.LinkDraw.name] as Draws.LinkDraw).state

        const pos = this.render.stage.getPointerPosition()

        if (pos) {
          // stage 状态
          const stageState = this.render.getStageState()

          // 临时 连接线 画
          if (linkDrawState.linkingLine) {
            const { circle, line } = linkDrawState.linkingLine
            line.points(
              _.flatten([
                [circle.x(), circle.y()],
                [
                  this.render.toStageValue(pos.x - stageState.x),
                  this.render.toStageValue(pos.y - stageState.y)
                ]
              ])
            )
          }
        }
      }
    }
  }
}

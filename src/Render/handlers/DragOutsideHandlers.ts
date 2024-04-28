import Konva from 'konva'
import { nanoid } from 'nanoid'
//
import { Render } from '../index'
import * as Types from '../types'
//
import * as Draws from '../draws'

export class DragOutsideHandlers implements Types.Handler {
  static readonly name = 'DragOutside'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  handlers = {
    dom: {
      dragenter: (e: GlobalEventHandlersEventMap['dragenter']) => {
        this.render.stage.setPointersPositions(e)
        // 更新参考线
        this.render.draws[Draws.RefLineDraw.name].draw()
      },
      dragover: (e: GlobalEventHandlersEventMap['dragover']) => {
        this.render.stage.setPointersPositions(e)
        // 更新参考线
        this.render.draws[Draws.RefLineDraw.name].draw()
      },
      drop: (e: GlobalEventHandlersEventMap['drop']) => {
        const src = e.dataTransfer?.getData('src')
        const type = e.dataTransfer?.getData('type')

        if (src && type) {
          // stage 状态
          const stageState = this.render.getStageState()

          this.render.stage.setPointersPositions(e)

          const pos = this.render.stage.getPointerPosition()
          if (pos) {
            this.render.assetTool[
              type === 'svg' ? `loadSvg` : type === 'gif' ? 'loadGif' : 'loadImg'
            ](src).then((image: Konva.Image) => {
              const group = new Konva.Group({
                id: nanoid(),
                width: image.width(),
                height: image.height(),
                name: 'asset'
              })

              this.render.layer.add(group)

              image.setAttrs({
                x: 0,
                y: 0
              })

              group.add(image)

              const x = this.render.toStageValue(pos.x - stageState.x) - group.width() / 2
              const y = this.render.toStageValue(pos.y - stageState.y) - group.height() / 2

              group.setAttrs({
                x,
                y
              })

              // 更新历史
              this.render.updateHistory()
              // 更新预览
              this.render.draws[Draws.PreviewDraw.name].draw()
            })
          }
        }
      }
    }
  }
}

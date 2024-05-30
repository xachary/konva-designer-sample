import Konva from 'konva'
import { nanoid } from 'nanoid'
//
import { Render } from '../index'
import * as Types from '../types'
//
import * as Draws from '../draws'

import { LinkGroupEventBind, LinkPointEventBind } from '../LinkPointHandlers'

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

              const points = [
                { x: group.width() / 2 - this.render.pointSize, y: -this.render.pointSize },
                {
                  x: group.width() / 2 - this.render.pointSize,
                  y: group.height() - this.render.pointSize
                },
                { y: group.height() / 2 - this.render.pointSize, x: -this.render.pointSize },
                {
                  y: group.height() / 2 - this.render.pointSize,
                  x: group.width() - this.render.pointSize
                }
              ]

              // 绑定连接线所需事件
              LinkGroupEventBind(this.render, group)

              // 默认连接点
              for (const point of points) {
                const node = new Konva.Circle({
                  id: nanoid(),
                  x: this.render.pointSize + point.x,
                  y: this.render.pointSize + point.y,
                  radius: this.render.toStageValue(this.render.pointSize),
                  stroke: 'rgba(255,0,0,0.5)',
                  strokeWidth: this.render.toStageValue(1),
                  name: 'point',
                  perfectDrawEnabled: false,

                  groupId: group.id(),
                  visible: false
                })
                // 绑定连接线所需事件
                LinkPointEventBind(this.render, group, node)
                group.add(node)
              }

              // hover 框（多选时才显示）
              group.add(
                new Konva.Rect({
                  id: 'hoverRect',
                  width: image.width(),
                  height: image.height(),
                  fill: 'rgba(0,255,0,0.3)',
                  visible: false
                })
              )
              // 隐藏 hover 框
              group.on('mouseleave', () => {
                group.findOne('#hoverRect')?.visible(false)
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

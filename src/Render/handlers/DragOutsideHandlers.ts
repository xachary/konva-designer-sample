import Konva from 'konva'
import { nanoid } from 'nanoid'
//
import { Render } from '../index'
import * as Types from '../types'
//
import * as Draws from '../draws'

import type { LinkDrawPoint } from '../draws/LinkDraw'

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
                // 左
                { x: 0, y: group.height() / 2 },
                // 右
                {
                  x: group.width(),
                  y: group.height() / 2
                },
                // 上
                { x: group.width() / 2, y: 0 },
                // 下
                {
                  x: group.width() / 2,
                  y: group.height()
                }
              ]

              // 连接点信息
              group.setAttrs({
                points: points.map(
                  (o) =>
                    ({
                      ...o,
                      id: nanoid(),
                      groupId: group.id(),
                      visible: false,
                      pairs: []
                    }) as LinkDrawPoint
                )
              })

              // 连接点（锚点）
              for (const point of group.getAttr('points') ?? []) {
                group.add(
                  new Konva.Circle({
                    name: 'link-anchor',
                    id: point.id,
                    x: point.x,
                    y: point.y,
                    radius: this.render.toStageValue(1),
                    stroke: 'rgba(0,0,255,1)',
                    strokeWidth: this.render.toStageValue(2),
                    visible: false
                  })
                )
              }

              group.on('mouseenter', () => {
                // 显示 连接点
                this.render.linkTool.pointsVisible(true, group)
              })

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

              group.on('mouseleave', () => {
                // 隐藏 连接点
                this.render.linkTool.pointsVisible(false, group)

                // 隐藏 hover 框
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

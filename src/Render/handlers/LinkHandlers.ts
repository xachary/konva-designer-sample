import Konva from 'konva'
import _ from 'lodash-es'
import { nanoid } from 'nanoid'
//
import { Render } from '../index'
import * as Types from '../types'
//
import * as Draws from '../draws'
//
import { LinkPointUpdate } from '../LinkPointHandlers'

import type { LinkDrawPairPoint } from '../draws/LinkDraw'

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

        const groups = this.render.layer.getChildren((node) => node instanceof Konva.Group)
        for (const g of groups) {
          const points = (g as Konva.Group).find('.point')
          for (const point of points) {
            ;(point as Konva.Circle).stroke('rgba(255,0,0,0.5)')
            ;(point as Konva.Circle).visible(false)
          }
        }

        linkDrawState.linkFrom.group = null
        linkDrawState.linkFrom.circle = null
        linkDrawState.linkTo.group = null
        linkDrawState.linkTo.circle = null

        const { pair, pointCircle, link, pointGroup, point } = linkDrawState.linkPoint

        if (pair && pair.points && pointCircle && link && pointGroup && point) {
          if (
            !point.changed &&
            (pointCircle.x() !== pointCircle.attrs.linkPointDragPos.x ||
              pointCircle.y() !== pointCircle.attrs.linkPointDragPos.y)
          ) {
            point.changed = true

            const points = link.points()

            const fullPoints: LinkDrawPairPoint[] = [
              {
                pos: {
                  x: points[0],
                  y: points[1]
                },
                active: true,
                id: '',
                changed: false
              },
              ...pair.points,
              {
                pos: {
                  x: points[points.length - 2],
                  y: points[points.length - 1]
                },
                active: true,
                id: '',
                changed: false
              }
            ]

            const index = fullPoints.findIndex((o) => o.id === point.id)

            const fx = fullPoints[index - 1].pos.x
            const fy = fullPoints[index - 1].pos.y
            const x = fullPoints[index].pos.x
            const y = fullPoints[index].pos.y
            const bx = fullPoints[index + 1].pos.x
            const by = fullPoints[index + 1].pos.y

            const left = {
              x: fx + (x - fx) / 2,
              y: fy + (y - fy) / 2
            }

            const right = {
              x: x + (bx - x) / 2,
              y: y + (by - y) / 2
            }

            const leftId = nanoid()
            const rightId = nanoid()

            const index2 = pair.points.findIndex((o) => o.id === point.id)
            pair.points.splice(index2 + 1, 0, {
              pos: right,
              changed: false,
              id: rightId,
              active: false
            })
            pair.points.splice(index2, 0, {
              pos: left,
              changed: false,
              id: leftId,
              active: false
            })

            link.points([
              points[0],
              points[1],
              ..._.flatten(pair.points.filter((o) => o.active).map((o) => [o.pos.x, o.pos.y])),
              points[points.length - 2],
              points[points.length - 1]
            ])

            // 更新连线
            this.render.draws[Draws.LinkDraw.name].draw()
            // 更新预览
            this.render.draws[Draws.PreviewDraw.name].draw()
          }
        }

        linkDrawState.linkPoint = {
          pair: null,
          pointCircle: null,
          link: null,
          pointGroup: null,
          point: null
        }

        linkDrawState.linkGroupNode?.remove()
        linkDrawState.linkGroupNode = null
      },
      mousemove: () => {
        const linkDrawState = (this.render.draws[Draws.LinkDraw.name] as Draws.LinkDraw).state

        const pos = this.render.stage.getPointerPosition()

        if (pos) {
          if (linkDrawState.linkGroupNode) {
            const link = linkDrawState.linkGroupNode.find('.link-current')[0] as Konva.Line
            if (link) {
              const [startX, startY] = link.points()

              if (startX !== void 0 && startY !== void 0) {
                link.points(
                  _.flatten([
                    [startX, startY],
                    [
                      this.render.toStageValue(pos.x - this.render.getStageState().x),
                      this.render.toStageValue(pos.y - this.render.getStageState().y)
                    ]
                  ])
                )
              }
            }
          } else {
            LinkPointUpdate(this.render)
          }
        }
      },
      mousedown: (e: Konva.KonvaEventObject<GlobalEventHandlersEventMap['mousedown']>) => {
        if (e.target.name() !== 'link-point') {
          this.render.linkTool.updateSelection()
        }
      }
    }
  }
}

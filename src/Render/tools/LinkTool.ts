import Konva from 'konva'
//
import { Render } from '../index'
//
import * as Draws from '../draws'

import type { LinkDrawPair, LinkDrawPoint } from '../draws/LinkDraw'

export class LinkTool {
  static readonly name = 'LinkTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  pointsVisibleEach(visible: boolean, group: Konva.Group) {
    const points = group.getAttr('points') ?? []

    group.setAttrs({
      points: points.map((o: any) => ({ ...o, visible }))
    })
  }

  pointsVisible(visible: boolean, group?: Konva.Group) {
    if (group) {
      this.pointsVisibleEach(visible, group)
    } else {
      const groups = this.render.layer.find('.asset') as Konva.Group[]
      for (const group of groups) {
        this.pointsVisibleEach(visible, group)
      }
    }

    // 重绘
    this.render.redraw()
  }

  remove(line: Konva.Line) {
    const { groupId, pointId, pairId } = line.getAttrs()
    if (groupId && pointId && pairId) {
      const group = this.render.layer.findOne(`#${groupId}`) as Konva.Group
      if (group) {
        const points = (group.getAttr('points') ?? []) as LinkDrawPoint[]
        const point = points.find((o) => o.id === pointId)
        if (point) {
          const pairIndex = (point.pairs ?? ([] as LinkDrawPair[])).findIndex(
            (o) => o.id === pairId
          )
          if (pairIndex > -1) {
            point.pairs.splice(pairIndex, 1)
            group.setAttr('points', points)

            // 重绘
            this.render.redraw()
          }
        }
      }
    }
  }
}

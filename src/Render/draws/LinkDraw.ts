import _ from 'lodash-es'
import Konva from 'konva'
import { nanoid } from 'nanoid'
//
import * as Types from '../types'

import { LinkPointCircleEventBind } from '../LinkPointHandlers'

export interface LinkDrawOption {
  //
}

export interface LinkDrawPairPoint {
  pos: {
    x: number
    y: number
  }
  changed: boolean
  active: boolean
  id: string
}

export interface LinkDrawPair {
  from: {
    groupId: string
    circleId: string
  }
  to: {
    groupId: string
    circleId: string
  }
  points: Array<LinkDrawPairPoint> | null
  selected: boolean
}

export interface LinkDrawState {
  linkGroupNode: Konva.Group | null
  linkFrom: {
    group: Konva.Group | null
    circle: Konva.Circle | null
  }
  linkTo: {
    group: Konva.Group | null
    circle: Konva.Circle | null
  }
  //
  linkPairs: Array<LinkDrawPair>
  linkPoint: {
    pair: LinkDrawPair | null
    pointCircle: Konva.Circle | null
    link: Konva.Line | null
    pointGroup: Konva.Group | null
    point: LinkDrawPairPoint | null
  }
}

export const LinkDrawParams = {
  pointSize: 6
}

export class LinkDraw extends Types.BaseDraw implements Types.Draw {
  static override readonly name = 'Link'

  option: LinkDrawOption

  state: LinkDrawState = {
    linkGroupNode: null,
    linkFrom: {
      group: null,
      circle: null
    },
    linkTo: {
      group: null,
      circle: null
    },
    //
    linkPairs: [],
    linkPoint: {
      pair: null,
      pointCircle: null,
      link: null,
      pointGroup: null,
      point: null
    }
  }

  on = {}

  constructor(render: Types.Render, layer: Konva.Layer, option: LinkDrawOption) {
    super(render, layer)

    this.option = option

    this.group.name(this.constructor.name)
  }

  override clear() {
    for (const linkGroupNode of this.layer.getChildren().filter((o) => o.name() === 'link-group')) {
      linkGroupNode.remove()
    }
  }

  override draw() {
    this.clear()

    const nodes = this.layer.getChildren()

    for (const pair of this.state.linkPairs) {
      const fromGroup = nodes.find((o) => o.id() === pair.from.groupId) as Konva.Group
      const toGroup = nodes.find((o) => o.id() === pair.to.groupId) as Konva.Group

      if (fromGroup && toGroup) {
        const fromCircle = fromGroup.getChildren(
          (o) => o instanceof Konva.Circle && o.id() === pair.from.circleId
        )[0] as Konva.Circle
        const toCircle = toGroup.getChildren(
          (o) => o instanceof Konva.Circle && o.id() === pair.to.circleId
        )[0] as Konva.Circle

        if (fromCircle && toCircle) {
          const linkGroupNode = new Konva.Group({
            name: 'link-group',
            fromGroupId: pair.from.groupId,
            fromcircleId: pair.from.circleId,
            toGroupId: pair.to.groupId,
            tocircleId: pair.to.circleId
          })
          const from = [
            fromGroup.x() + fromCircle.x() * fromGroup.scaleX(),
            fromGroup.y() + fromCircle.y() * fromGroup.scaleY()
          ]
          const to = [
            toGroup.x() + toCircle.x() * toGroup.scaleX(),
            toGroup.y() + toCircle.y() * toGroup.scaleY()
          ]

          if (!pair.points) {
            pair.points = [
              {
                pos: {
                  x: from[0] + (to[0] - from[0]) / 2,
                  y: from[1] + (to[1] - from[1]) / 2
                },
                changed: false,
                active: false,
                id: nanoid()
              }
            ]
          }

          const link = new Konva.Line({
            name: 'link',
            points: _.flatten([
              from,
              ...pair.points.filter((o) => o.active).map((o) => [o.pos.x, o.pos.y]),
              to
            ]),
            stroke: 'blue',
            strokeWidth: 2,
            pairPoints: pair.points,
            dash: pair.selected ? [4, 4] : []
          })
          linkGroupNode.add(link)

          for (const point of pair.points) {
            const node = new Konva.Circle({
              x: point.pos.x,
              y: point.pos.y,
              radius: this.render.toStageValue(LinkDrawParams.pointSize),
              stroke: point.changed ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,255,0.5)',
              strokeWidth: this.render.toStageValue(1),
              name: 'link-point',
              perfectDrawEnabled: false,
              visible: false,
              id: point.id
            })

            LinkPointCircleEventBind(node, this.state, pair, link, linkGroupNode, point)

            linkGroupNode.add(node)
          }

          linkGroupNode.on('mouseenter', (e) => {
            e.evt.preventDefault()

            const points = linkGroupNode.find('.link-point')
            for (const point of points) {
              point.visible(true)
            }
          })
          linkGroupNode.on('mouseleave', (e) => {
            e.evt.preventDefault()

            if (!this.state.linkPoint.pointCircle) {
              const points = linkGroupNode.find('.link-point')
              for (const point of points) {
                point.visible(false)
              }
            }
          })

          link.on('mousedown', (e) => {
            if (e.evt.button === Types.MouseButton.左键) {
              this.render.linkTool.updateSelection(pair)
            }
          })

          link.on('mouseenter', (e) => {
            document.body.style.cursor = 'pointer'
          })

          link.on('mouseleave', (e) => {
            document.body.style.cursor = 'default'
          })

          this.layer.add(linkGroupNode)
        }
      }
    }
  }
}

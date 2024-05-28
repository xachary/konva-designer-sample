import _ from 'lodash-es'
import Konva from 'konva'
//
import { Render } from './index'
//
import * as Draws from './draws'
//
import type { LinkDrawState, LinkDrawPair, LinkDrawPairPoint } from './draws/LinkDraw'

export function LinkPointEventBind(render: Render, group: Konva.Group, node: Konva.Circle) {
  const linkDrawState = (render.draws[Draws.LinkDraw.name] as Draws.LinkDraw).state

  group.on('mouseenter', () => {
    const points = group.find('.point')
    for (const point of points) {
      ;(point as Konva.Circle).visible(true)
    }
  })
  group.on('mouseleave', () => {
    if (group.id() !== linkDrawState.linkFrom.group?.id()) {
      const points = group.find('.point')
      for (const point of points) {
        ;(point as Konva.Circle).visible(false)
      }
    }
  })
  node.on('mousedown', (e) => {
    e.evt.preventDefault()

    render.selectionTool.selectingClear()

    linkDrawState.linkFrom.group = null
    linkDrawState.linkFrom.circle = null
    linkDrawState.linkTo.group = null
    linkDrawState.linkTo.circle = null

    linkDrawState.linkGroupNode?.remove()
    linkDrawState.linkGroupNode = null

    let linkGroupNode: Konva.Group | null = null
    let link: Konva.Line | null = null

    linkGroupNode = new Konva.Group({
      name: 'link-group-current',
      groupId: group.id(),
      circleId: node.id()
    })
    link = new Konva.Line({
      name: 'link-current',
      points: _.flatten([[group.x() + node.x(), group.y() + node.y()]]),
      stroke: 'red',
      strokeWidth: 2,
      listening: false
    })

    linkDrawState.linkFrom.group = group
    linkDrawState.linkFrom.circle = node

    if (linkGroupNode && link) {
      linkGroupNode.add(link)
      linkDrawState.linkGroupNode = linkGroupNode

      render.layer.add(linkGroupNode)
    }

    // 更新连线
    render.draws[Draws.LinkDraw.name].draw()
    // 更新预览
    render.draws[Draws.PreviewDraw.name].draw()
  })
  node.on('mouseup', (e) => {
    e.evt.preventDefault()

    if (
      linkDrawState.linkFrom.group &&
      linkDrawState.linkFrom.circle &&
      linkDrawState.linkTo.group &&
      linkDrawState.linkTo.circle
    ) {
      const pair = linkDrawState.linkPairs.find(
        (o) =>
          o.from.circleId === linkDrawState.linkFrom.circle!.id() &&
          o.to.circleId === linkDrawState.linkTo.circle!.id()
      )
      if (!pair) {
        linkDrawState.linkPairs.push({
          from: {
            groupId: linkDrawState.linkFrom.group!.id(),
            circleId: linkDrawState.linkFrom.circle!.id()
          },
          to: {
            groupId: linkDrawState.linkTo.group!.id(),
            circleId: linkDrawState.linkTo.circle!.id()
          },
          points: null,
          selected: false
        })
        // 更新连线
        render.draws[Draws.LinkDraw.name].draw()
        // 更新预览
        render.draws[Draws.PreviewDraw.name].draw()
      }
    }

    linkDrawState.linkFrom.group = null
    linkDrawState.linkFrom.circle = null
    linkDrawState.linkTo.group = null
    linkDrawState.linkTo.circle = null

    linkDrawState.linkGroupNode?.remove()
    linkDrawState.linkGroupNode = null
  })
  node.on('mouseenter', (e) => {
    document.body.style.cursor = 'pointer'

    if (linkDrawState.linkFrom.group && linkDrawState.linkFrom.circle) {
      if (
        e.target.id() !== linkDrawState.linkFrom.circle.id() &&
        e.target.attrs.groupId !== linkDrawState.linkFrom.group.id()
      ) {
        const pair = linkDrawState.linkPairs.find(
          (o) =>
            o.from.circleId === linkDrawState.linkFrom.circle!.id() &&
            o.to.circleId === e.target.id()
        )
        if (!pair) {
          linkDrawState.linkTo.group = e.target.parent as Konva.Group
          linkDrawState.linkTo.circle = e.target as Konva.Circle
          ;(e.target as Konva.Circle).stroke('rgba(255,0,0,1)')
        }
      }
    } else {
      ;(e.target as Konva.Circle).stroke('rgba(255,0,0,1)')
    }
  })
  node.on('mouseleave', (e) => {
    document.body.style.cursor = 'default'

    if (linkDrawState.linkFrom.group && linkDrawState.linkFrom.circle) {
      if (
        e.target.id() !== linkDrawState.linkFrom.circle.id() &&
        e.target.attrs.groupId !== linkDrawState.linkFrom.group.id()
      ) {
        linkDrawState.linkTo.group = null
        linkDrawState.linkTo.circle = null
        ;(e.target as Konva.Circle).stroke('rgba(255,0,0,0.5)')
      }
    } else {
      ;(e.target as Konva.Circle).stroke('rgba(255,0,0,0.5)')
    }
  })
}

export function LinkPointCircleEventBind(
  node: Konva.Circle,
  state: LinkDrawState,
  pair: LinkDrawPair,
  link: Konva.Line,
  linkGroupNode: Konva.Group,
  point: LinkDrawPairPoint
) {
  node.on('mouseenter', (e) => {
    e.evt.preventDefault()

    document.body.style.cursor = 'pointer'

    node.stroke(point.changed ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,255,1)')
  })
  node.on('mouseleave', (e) => {
    e.evt.preventDefault()

    document.body.style.cursor = 'default'

    node.stroke(point.changed ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,255,0.5)')
  })
  node.on('mousedown', (e) => {
    e.evt.preventDefault()

    node.setAttrs({
      linkPointDragPos: node.position()
    })

    state.linkPoint = {
      pair,
      pointCircle: node,
      link,
      pointGroup: linkGroupNode,
      point
    }

    if (pair.points) {
      point.active = true

      const points = link.points()
      link.points([
        points[0],
        points[1],
        ..._.flatten(pair.points.filter((o) => o.active).map((o) => [o.pos.x, o.pos.y])),
        points[points.length - 2],
        points[points.length - 1]
      ])
    }
  })
}

export function LinkPointCircleUpdate(
  linkGroup: Konva.Group,
  link: Konva.Line,
  pair: LinkDrawPair
) {
  const linkPoints = linkGroup.find('.link-point')

  const points = link.points()

  if (pair.points) {
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

    for (let i = 0; i < fullPoints.length; i++) {
      if (!fullPoints[i].active) {
        if (fullPoints[i - 1] && fullPoints[i + 1]) {
          fullPoints[i].pos = {
            x: fullPoints[i - 1].pos.x + (fullPoints[i + 1].pos.x - fullPoints[i - 1].pos.x) / 2,
            y: fullPoints[i - 1].pos.y + (fullPoints[i + 1].pos.y - fullPoints[i - 1].pos.y) / 2
          }
          const circle = linkPoints.find((o) => o.id() === fullPoints[i].id)
          if (circle) {
            circle.position(fullPoints[i].pos)
          }
        }
      }
    }
    link.setAttrs({
      points: [
        points[0],
        points[1],
        ..._.flatten(pair.points.filter((o) => o.active).map((o) => [o.pos.x, o.pos.y])),
        points[points.length - 2],
        points[points.length - 1]
      ],
      pairPoints: pair.points
    })
  }
}

export function LinkPointCircleUpdateAll(render: Render) {
  const linkDrawState = (render.draws[Draws.LinkDraw.name] as Draws.LinkDraw).state

  const linkGroups = render.layer.getChildren((o) => o.name() === 'link-group') as Konva.Group[]

  for (const linkGroup of linkGroups) {
    const linkPoints = linkGroup.find('.link-point')
    for (const point of linkPoints) {
      point.setAttrs({
        scale: {
          x: render.toStageValue(1) / linkGroup.scaleX(),
          y: render.toStageValue(1) / linkGroup.scaleY()
        }
      })
    }

    const link = linkGroup.find('.link')[0] as Konva.Line

    const pair = linkDrawState.linkPairs.find(
      (o) =>
        o.from.groupId === linkGroup.attrs.fromGroupId &&
        o.from.circleId === linkGroup.attrs.fromcircleId &&
        o.to.groupId === linkGroup.attrs.toGroupId &&
        o.to.circleId === linkGroup.attrs.tocircleId
    ) as LinkDrawPair

    LinkPointCircleUpdate(linkGroup, link, pair)
  }
}

export function LinkPointUpdate(render: Render) {
  const linkDrawState = (render.draws[Draws.LinkDraw.name] as Draws.LinkDraw).state

  const pos = render.stage.getPointerPosition()

  if (pos) {
    const { pair, pointCircle, link, pointGroup, point } = linkDrawState.linkPoint

    if (pair && pointCircle && link && pointGroup && point) {
      const x = render.toStageValue(pos.x - render.getStageState().x)
      const y = render.toStageValue(pos.y - render.getStageState().y)

      pointCircle.setAttrs({
        x,
        y
      })

      point.pos = {
        x,
        y
      }

      LinkPointCircleUpdate(pointGroup, link, pair)
    }
  }
}

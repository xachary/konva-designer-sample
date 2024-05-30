import _ from 'lodash-es'
import Konva from 'konva'
//
import { Render } from './index'
//
import * as Draws from './draws'
//
import type { LinkDrawState, LinkDrawPair, LinkDrawPairPoint } from './draws/LinkDraw'

export function LinkGroupEventBind(render: Render, group: Konva.Group) {
  const linkDrawState = (render.draws[Draws.LinkDraw.name] as Draws.LinkDraw).state

  // 避免复制重复绑定
  group.off('mouseenter')
  group.off('mouseleave')

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
}

export function LinkPointEventBind(render: Render, group: Konva.Group, node: Konva.Circle) {
  const linkDrawState = (render.draws[Draws.LinkDraw.name] as Draws.LinkDraw).state

  node.off('mousedown')
  node.off('mouseup')
  node.off('mouseenter')
  node.off('mouseleave')

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
  const stageState = render.getStageState()

  const pos = render.stage.getPointerPosition()

  if (pos) {
    const { pair, pointCircle, link, pointGroup, point } = linkDrawState.linkPoint

    if (pair && pointCircle && link && pointGroup && point) {
      const x = render.toStageValue(pos.x - stageState.x)
      const y = render.toStageValue(pos.y - stageState.y)

      pointCircle.setAttrs({
        x,
        y
      })

      point.pos = {
        x,
        y
      }

      // 磁贴（基于网格）
      if (render.config.attractBg) {
        // stage 状态

        const logicLeftX = point.pos.x // x坐标
        const logicNumLeftX = Math.round(logicLeftX / render.bgSize) // x单元格个数
        const logicClosestLeftX = logicNumLeftX * render.bgSize // x磁贴目标坐标
        const logicDiffLeftX = Math.abs(logicLeftX - logicClosestLeftX) // x磁贴偏移量

        const logicRightX = point.pos.x // x坐标
        const logicNumRightX = Math.round(logicRightX / render.bgSize) // x单元格个数
        const logicClosestRightX = logicNumRightX * render.bgSize // x磁贴目标坐标
        const logicDiffRightX = Math.abs(logicRightX - logicClosestRightX) // x磁贴偏移量

        // 距离近优先
        for (const diff of [
          { type: 'leftX', value: logicDiffLeftX },
          { type: 'rightX', value: logicDiffRightX }
        ].sort((a, b) => a.value - b.value)) {
          if (diff.value < 5) {
            if (diff.type === 'leftX') {
              point.pos.x = logicClosestLeftX
            } else if (diff.type === 'rightX') {
              point.pos.x = logicClosestRightX
            }
            break
          }
        }

        const logicTopY = point.pos.y // y坐标
        const logicNumTopY = Math.round(logicTopY / render.bgSize) // y单元格个数
        const logicClosestTopY = logicNumTopY * render.bgSize // y磁贴目标坐标
        const logicDiffTopY = Math.abs(logicTopY - logicClosestTopY) // y磁贴偏移量

        const logicBottomY = point.pos.y // y坐标
        const logicNumBottomY = Math.round(logicBottomY / render.bgSize) // y单元格个数
        const logicClosestBottomY = logicNumBottomY * render.bgSize // y磁贴目标坐标
        const logicDiffBottomY = Math.abs(logicBottomY - logicClosestBottomY) // y磁贴偏移量

        // 距离近优先
        for (const diff of [
          { type: 'topY', value: logicDiffTopY },
          { type: 'bottomY', value: logicDiffBottomY }
        ].sort((a, b) => a.value - b.value)) {
          if (diff.value < 5) {
            if (diff.type === 'topY') {
              point.pos.y = logicClosestTopY
            } else if (diff.type === 'bottomY') {
              point.pos.y = logicClosestBottomY
            }
            break
          }
        }

        pointCircle.setAttrs({
          x: point.pos.x,
          y: point.pos.y
        })
      }

      LinkPointCircleUpdate(pointGroup, link, pair)
    }
  }
}

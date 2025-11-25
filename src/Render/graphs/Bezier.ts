import _ from 'lodash-es'
import Konva from 'konva'

import * as Types from '../types'
import * as Draws from '../draws'

import { BaseGraph } from './BaseGraph'

// TODO: 贝赛尔曲线
/**
 * 贝赛尔曲线
 */
export class Bezier extends BaseGraph {
  // 实现：更新 图形 的 调整点 的 锚点位置
  static override updateAnchorShadows(
    graph: Konva.Group,
    anchorShadows: Konva.Circle[],
    shape?: Konva.Line
  ): void {
    if (shape) {
      const points = shape.points()
      //
      for (const shadow of anchorShadows) {
        switch (shadow.attrs.adjustType) {
          case 'start':
            shadow.position({
              x: points[0],
              y: points[1]
            })
            break
          case 'end':
            shadow.position({
              x: points[points.length - 2],
              y: points[points.length - 1]
            })
            break
        }
      }
    }
  }
  // 实现：更新 图形 的 连接点 的 锚点位置
  static override updateLinkAnchorShadows(
    graph: Konva.Group,
    linkAnchorShadows: Konva.Circle[],
    shape?: Konva.Line
  ): void {
    if (shape) {
      const points = shape.points()
      //
      for (const shadow of linkAnchorShadows) {
        switch (shadow.attrs.alias) {
          case 'start':
            shadow.position({
              x: points[0],
              y: points[1]
            })
            break
          case 'end':
            shadow.position({
              x: points[points.length - 2],
              y: points[points.length - 1]
            })
            break
        }
      }
    }
  }

  static calculateAngle(sideA: number, sideB: number) {
    if (!isNaN(sideA) && !isNaN(sideB)) {
      const angleInRadians = Math.atan2(sideA, sideB)
      const angleInDegrees = angleInRadians * (180 / Math.PI)
      return angleInDegrees
    }
    return 0
  }

  // 实现：生成 调整点
  static override createAnchorShapes(
    render: Types.Render,
    graph: Konva.Group,
    anchorAndShadows: {
      anchor: Types.GraphAnchor
      anchorShadow: Konva.Circle
      shape?: Konva.Shape
    }[],
    // eslint-disable-next-line
    adjustAnchor?: Types.GraphAnchor
  ): {
    anchorAndShadows: {
      anchor: Types.GraphAnchor
      anchorShadow: Konva.Circle
      shape?: Konva.Shape | undefined
    }[]
  } {
    // stage 状态
    const stageState = render.getStageState()

    const graphShape = graph.findOne('.graph') as Konva.Line

    if (graphShape) {
      const points = graphShape.points()

      for (const anchorAndShadow of anchorAndShadows) {
        let rotate = 0
        const { anchor, anchorShadow } = anchorAndShadow

        const x = render.toStageValue(anchorShadow.getAbsolutePosition().x - stageState.x),
          y = render.toStageValue(anchorShadow.getAbsolutePosition().y - stageState.y)

        if (anchor.adjustType === 'manual') {
          const anchorShape = new Konva.Circle({
            name: 'anchor',
            anchor: anchor,
            //
            fill: anchor.adjusted ? `rgba(0,0,0,0.4)` : `rgba(0,0,255,0.4)`,
            radius: render.toStageValue(5),
            strokeWidth: 0,
            // 位置
            x: x,
            y: y,
            // 旋转角度
            rotation: graph.getAbsoluteRotation(),
            // 阻止多余的调整点出现
            visible:
              (graph.attrs.adjusting || graph.attrs.hover === true) &&
              (anchor.adjusted || anchorAndShadows.length <= 6)
          })

          anchorShape.on('mouseenter', () => {
            document.body.style.cursor = 'move'

            graph.setAttr('hover', true)
            graph.setAttr('hoverAnchor', true)
          })
          anchorShape.on('mouseleave', () => {
            document.body.style.cursor = anchorShape.attrs.adjusting ? 'move' : 'default'

            graph.setAttr('hover', false)
            graph.setAttr('hoverAnchor', false)
            // 进入其他元素区域时离开需要靠它 redraw
            render.redraw([Draws.GraphDraw.name])
          })

          anchorAndShadow.shape = anchorShape
        } else {
          if (anchor.adjustType === 'start') {
            rotate = Bezier.calculateAngle(points[2] - points[0], points[3] - points[1])
          } else if (anchor.adjustType === 'end') {
            rotate = Bezier.calculateAngle(
              points[points.length - 2] - points[points.length - 4],
              points[points.length - 1] - points[points.length - 3]
            )
          }

          const cos = Math.cos((rotate * Math.PI) / 180)
          const sin = Math.sin((rotate * Math.PI) / 180)

          const offset = render.toStageValue(render.pointSize - 20)

          const offsetX = offset * sin
          const offsetY = offset * cos

          const anchorShape = new Konva.Circle({
            name: 'anchor',
            anchor: anchor,
            //
            fill: `rgba(0,0,255,0.4)`,
            radius: render.toStageValue(5),
            strokeWidth: 0,
            // 位置
            x: x,
            y: y,
            offsetX:
              anchor.adjustType === 'start' ? offsetX : anchor.adjustType === 'end' ? -offsetX : 0,
            offsetY:
              anchor.adjustType === 'start' ? offsetY : anchor.adjustType === 'end' ? -offsetY : 0,
            // 旋转角度
            rotation: graph.getAbsoluteRotation(),
            visible: graph.attrs.adjusting || graph.attrs.hover === true
          })

          anchorShape.on('mouseenter', () => {
            document.body.style.cursor = 'move'

            graph.setAttr('hover', true)
            graph.setAttr('hoverAnchor', true)
          })
          anchorShape.on('mouseleave', () => {
            document.body.style.cursor = anchorShape.attrs.adjusting ? 'move' : 'default'

            graph.setAttr('hover', false)
            graph.setAttr('hoverAnchor', false)
            // 进入其他元素区域时离开需要靠它 redraw
            render.redraw([Draws.GraphDraw.name])
          })

          anchorAndShadow.shape = anchorShape
        }
      }
    }

    return { anchorAndShadows }
  }

  /**
   * 矩阵变换：坐标系中的一个点，围绕着另外一个点进行旋转
   * -  -   -        - -   -   - -
   * |x`|   |cos -sin| |x-a|   |a|
   * |  | = |        | |   | +
   * |y`|   |sin  cos| |y-b|   |b|
   * -  -   -        - -   -   - -
   * @param x 目标节点坐标 x
   * @param y 目标节点坐标 y
   * @param centerX 围绕的点坐标 x
   * @param centerY 围绕的点坐标 y
   * @param angle 旋转角度
   * @returns
   */
  static rotatePoint(x: number, y: number, centerX: number, centerY: number, angle: number) {
    // 将角度转换为弧度
    const radians = (angle * Math.PI) / 180

    // 计算旋转后的坐标
    const newX = Math.cos(radians) * (x - centerX) - Math.sin(radians) * (y - centerY) + centerX
    const newY = Math.sin(radians) * (x - centerX) + Math.cos(radians) * (y - centerY) + centerY

    return { x: newX, y: newY }
  }

  // 实现：调整 图形
  static override adjust(
    render: Types.Render,
    graph: Konva.Group,
    graphSnap: Konva.Group,
    adjustShape: Konva.Shape,
    anchorAndShadows: {
      anchor: Types.GraphAnchor
      anchorShadow: Konva.Circle
      shape?: Konva.Shape | undefined
    }[],
    startPoint: Konva.Vector2d,
    endPoint: Konva.Vector2d,
    hoverRect?: Konva.Rect
  ) {
    // 目标 曲线
    const line = graph.findOne('.graph') as Konva.Line
    // 镜像
    const lineSnap = graphSnap.findOne('.graph') as Konva.Line

    // 调整点 锚点
    const anchors = (graph.find('.anchor') ?? []) as Konva.Circle[]
    // 镜像
    const anchorsSnap = (graphSnap.find('.anchor') ?? []) as Konva.Circle[]

    // 连接点 锚点
    const linkAnchors = (graph.find('.link-anchor') ?? []) as Konva.Circle[]

    if (line && lineSnap) {
      // stage 状态
      const stageState = render.getStageState()

      {
        const [graphRotation, adjustType, ex, ey] = [
          Math.round(graph.rotation()),
          adjustShape.attrs.anchor?.adjustType,
          endPoint.x,
          endPoint.y
        ]

        const { x: cx, y: cy, width: cw, height: ch } = graphSnap.getClientRect()

        const { x, y } = graph.position()

        const [centerX, centerY] = [cx + cw / 2, cy + ch / 2]

        const { x: sx, y: sy } = Bezier.rotatePoint(ex, ey, centerX, centerY, -graphRotation)
        const { x: rx, y: ry } = Bezier.rotatePoint(x, y, centerX, centerY, -graphRotation)

        const points = line.points()
        const manualPoints = (line.attrs.manualPoints ?? []) as Types.LineManualPoint[]

        if (adjustType === 'manual') {
          if (adjustShape.attrs.anchor?.manualIndex !== void 0) {
            const index = adjustShape.attrs.anchor?.adjusted
              ? adjustShape.attrs.anchor?.manualIndex
              : adjustShape.attrs.anchor?.manualIndex + 1

            const manualPointIndex = manualPoints.findIndex((o) => o.index === index)

            if (manualPointIndex > -1) {
              manualPoints[manualPointIndex].x = (sx - rx) / graph.scaleX()
              manualPoints[manualPointIndex].y = (sy - ry) / graph.scaleY()
            }

            const linkPoints = [
              [points[0], points[1]],
              ...manualPoints.sort((a, b) => a.index - b.index).map((o) => [o.x, o.y]),
              [points[points.length - 2], points[points.length - 1]]
            ]

            line.setAttr('manualPoints', manualPoints)

            line.points(_.flatten(linkPoints))

            //
            const adjustAnchorShadow = anchors.find(
              (o) => o.attrs.adjustType === 'manual' && o.attrs.manualIndex === index
            )
            if (adjustAnchorShadow) {
              adjustAnchorShadow.position({
                x: (sx - rx) / graph.scaleX(),
                y: (sy - ry) / graph.scaleY()
              })
            }
          }
        } else {
          const anchor = anchors.find((o) => o.attrs.adjustType === adjustType)
          const anchorShadow = anchorsSnap.find((o) => o.attrs.adjustType === adjustType)

          if (anchor && anchorShadow) {
            {
              const linkPoints = [
                [points[0], points[1]],
                ...manualPoints.sort((a, b) => a.index - b.index).map((o) => [o.x, o.y]),
                [points[points.length - 2], points[points.length - 1]]
              ]

              switch (adjustType) {
                case 'start':
                  {
                    linkPoints[0] = [(sx - rx) / graph.scaleX(), (sy - ry) / graph.scaleY()]
                    line.points(_.flatten(linkPoints))
                  }
                  break
                case 'end':
                  {
                    linkPoints[linkPoints.length - 1] = [
                      (sx - rx) / graph.scaleX(),
                      (sy - ry) / graph.scaleY()
                    ]
                    line.points(_.flatten(linkPoints))
                  }
                  break
              }
            }
          }
        }
      }

      // 更新 调整点（拐点）
      Bezier.updateAnchor(render, graph)

      // 更新 调整点 的 锚点 位置
      Bezier.updateAnchorShadows(graph, anchors, line)

      // 更新 图形 的 连接点 的 锚点位置
      Bezier.updateLinkAnchorShadows(graph, linkAnchors, line)

      // 更新 调整点 位置
      for (const anchor of anchors) {
        for (const { shape } of anchorAndShadows) {
          if (shape) {
            if (shape.attrs.anchor?.adjustType === anchor.attrs.adjustType) {
              const anchorShadow = graph
                .find(`.anchor`)
                .find((o) => o.attrs.adjustType === anchor.attrs.adjustType)

              if (anchorShadow) {
                shape.position({
                  x: render.toStageValue(anchorShadow.getAbsolutePosition().x - stageState.x),
                  y: render.toStageValue(anchorShadow.getAbsolutePosition().y - stageState.y)
                })
                shape.rotation(graph.getAbsoluteRotation())
              }
            }
          }
        }
      }

      // 重绘
      render.redraw([Draws.GraphDraw.name, Draws.LinkDraw.name, Draws.PreviewDraw.name])
    }

    const allXs = line.points().reduce((arr, item, idx) => {
      if (idx % 2 === 0) {
        arr.push(item)
      }
      return arr
    }, [] as number[])
    const allYs = line.points().reduce((arr, item, idx) => {
      if (idx % 2 === 1) {
        arr.push(item)
      }
      return arr
    }, [] as number[])

    const minX = Math.min(...allXs)
    const maxX = Math.max(...allXs)

    const minY = Math.min(...allYs)
    const maxY = Math.max(...allYs)

    BaseGraph.adjust(
      render,
      graph,
      graphSnap,
      adjustShape,
      anchorAndShadows,
      startPoint,
      endPoint,
      hoverRect,
      {
        width: maxX - minX,
        height: maxY - minY
      },
      {
        x: minX,
        y: minY
      }
    )
  }

  /**
   * 提供给 GraphDraw draw 使用
   */
  static override draw(graph: Konva.Group, render: Types.Render, adjustAnchor?: Types.GraphAnchor) {
    // 调整点 信息
    const anchors = (graph.attrs.anchors ?? []) as (Types.GraphAnchor & {
      manualIndex?: number
      adjusted?: boolean
    })[]
    // 调整点 锚点
    const anchorShapes = graph.find(`.anchor`)
    // 调整点 信息&锚点
    const anchorAndShadows = anchors
      .map((anchor) => ({
        anchor,
        anchorShadow: anchorShapes.find(
          (shape) =>
            shape.attrs.adjustType === anchor.adjustType &&
            shape.attrs.manualIndex === anchor.manualIndex
        ) as Konva.Circle
      }))
      .filter((o) => o.anchorShadow !== void 0)

    return Bezier.createAnchorShapes(render, graph, anchorAndShadows, adjustAnchor)
  }

  /**
   * 默认图形大小
   */
  static size = 100
  /**
   * 曲线 对应的 Konva 实例
   */
  private line: Konva.Line

  constructor(render: Types.Render, dropPoint: Konva.Vector2d) {
    super(render, dropPoint, {
      type: Types.GraphType.Bezier,
      // 定义了 2 个 调整点
      anchors: [{ adjustType: 'start' }, { adjustType: 'end' }].map((o) => ({
        adjustType: o.adjustType // 调整点 类型定义
      })),
      linkAnchors: [
        { x: 0, y: 0, alias: 'start' },
        { x: 0, y: 0, alias: 'end' }
      ] as Types.AssetInfoPoint[]
    })

    function rotatePoint(x1: number, y1: number, x2: number, y2: number, angleInDegrees: number) {
      const radians = angleInDegrees * (Math.PI / 180)
      const cosTheta = Math.cos(radians)
      const sinTheta = Math.sin(radians)

      // Translate point (x2, y2) to be relative to (x1, y1)
      const x = x2 - x1
      const y = y2 - y1

      // Rotate point
      const xPrime = cosTheta * x - sinTheta * y
      const yPrime = sinTheta * x + cosTheta * y

      // Translate back
      const xNew = xPrime + x1
      const yNew = yPrime + y1

      return { x: xNew, y: yNew }
    }

    function drawPointer(
      ctx: Konva.Context,
      shape: Konva.Shape,
      startX: number,
      startY: number,
      ctrlX: number,
      ctrlY: number
    ) {
      const x2 = startX + 12
      const y2 = startY - 6
      const x3 = startX + 12
      const y3 = startY + 6

      const angle = (Math.atan2(ctrlY - startY, ctrlX - startX) * 180) / Math.PI

      const p2 = rotatePoint(startX, startY, x2, y2, angle)
      const p3 = rotatePoint(startX, startY, x3, y3, angle)

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(p2.x, p2.y)
      ctx.lineTo(p3.x, p3.y)
      ctx.lineTo(startX, startY)
      ctx.lineTo(p2.x, p2.y)

      ctx.strokeShape(shape)
      ctx.fillShape(shape)
    }

    // 新建 曲线
    this.line = new Konva.Arrow({
      name: 'graph',
      x: 0,
      y: 0,
      stroke: this.render.getPageSettings().stroke,
      strokeWidth: this.render.getPageSettings().strokeWidth,
      fill: this.render.getPageSettings().stroke,
      points: [],
      pointerAtBeginning: true,
      pointerAtEnding: true,
      lineJoin: 'miter',
      //
      sceneFunc: (ctx: Konva.Context, shape: Konva.Shape) => {
        if (shape instanceof Konva.Arrow) {
          const ps = shape.points()
          if (ps.length / 2 === 4) {
            // 三次
            ctx.beginPath()

            ctx.moveTo(ps[0], ps[1])
            ctx.bezierCurveTo(ps[2], ps[3], ps[4], ps[5], ps[6], ps[7])
            ctx.strokeShape(shape)

            ctx.closePath()

            shape.pointerAtBeginning() && drawPointer(ctx, shape, ps[0], ps[1], ps[2], ps[3])

            shape.pointerAtEnding() && drawPointer(ctx, shape, ps[6], ps[7], ps[4], ps[5])
          } else if (ps.length / 2 === 3) {
            // 二次
            ctx.beginPath()

            ctx.moveTo(ps[0], ps[1])
            ctx.quadraticCurveTo(ps[2], ps[3], ps[4], ps[5])
            ctx.strokeShape(shape)

            ctx.closePath()

            shape.pointerAtBeginning() && drawPointer(ctx, shape, ps[0], ps[1], ps[2], ps[3])

            shape.pointerAtEnding() && drawPointer(ctx, shape, ps[4], ps[5], ps[2], ps[3])
          } else {
            // 直线
            ctx.beginPath()

            ctx.moveTo(ps[0], ps[1])
            ctx.lineTo(ps[2], ps[3])
            ctx.strokeShape(shape)

            ctx.closePath()

            shape.pointerAtBeginning() && drawPointer(ctx, shape, ps[0], ps[1], ps[2], ps[3])

            shape.pointerAtEnding() && drawPointer(ctx, shape, ps[2], ps[3], ps[0], ps[1])
          }
        }
      }
    })

    // 给予 1 像素，防止导出图片 toDataURL 失败
    this.group.size({
      width: 1,
      height: 1
    })

    // 加入
    this.group.add(this.line)
    // 鼠标按下位置 作为起点
    this.group.position(this.dropPoint)
  }

  // 实现：拖动进行时
  override drawMove(point: Konva.Vector2d): void {
    // 鼠标拖动偏移量
    const offsetX = point.x - this.dropPoint.x,
      offsetY = point.y - this.dropPoint.y

    // 起点、终点
    const linkPoints = [
      [this.line.x(), this.line.y()],
      [this.line.x() + offsetX, this.line.y() + offsetY]
    ]

    // 曲线 路径
    this.line.points(_.flatten(linkPoints))

    // 更新 图形 的 调整点 的 锚点位置
    Bezier.updateAnchorShadows(this.group, this.anchorShadows, this.line)

    // 更新 图形 的 连接点 的 锚点位置
    Bezier.updateLinkAnchorShadows(this.group, this.linkAnchorShadows, this.line)

    // 重绘
    this.render.redraw([Draws.GraphDraw.name, Draws.LinkDraw.name, Draws.PreviewDraw.name])
  }

  // 实现：拖动结束
  override drawEnd(): void {
    if (this.line.width() <= 10 && this.line.height() <= 10) {
      // 加入只点击，无拖动

      // 默认大小
      const width = Bezier.size,
        height = width

      // 起点、终点
      const linkPoints = [
        [this.line.x(), this.line.y()],
        [this.line.x() + width, this.line.y() + height]
      ]

      // 曲线 位置大小
      this.line.points(_.flatten(linkPoints))
    }

    // 更新 调整点（拐点）
    Bezier.updateAnchor(this.render, this.group)

    // 更新 图形 的 调整点 的 锚点位置
    Bezier.updateAnchorShadows(this.group, this.anchorShadows, this.line)

    // 更新 图形 的 连接点 的 锚点位置
    Bezier.updateLinkAnchorShadows(this.group, this.linkAnchorShadows, this.line)

    // 扣除多余的间隙
    const size = {
      width: this.line.size().width - 10,
      height: this.line.size().height - 10
    }
    // 更新大小
    this.group.size(size)

    // 对齐线清除
    this.render.attractTool.alignLinesClear()

    // 更新历史
    this.render.updateHistory()

    // 重绘
    this.render.redraw([Draws.GraphDraw.name, Draws.LinkDraw.name, Draws.PreviewDraw.name])

    super.drawEnd(size, {
      x: Math.min(
        ...this.line.points().reduce((arr, item, idx) => {
          if (idx % 2 === 0) {
            arr.push(item)
          }
          return arr
        }, [] as number[])
      ),
      y: Math.min(
        ...this.line.points().reduce((arr, item, idx) => {
          if (idx % 2 === 1) {
            arr.push(item)
          }
          return arr
        }, [] as number[])
      )
    })
  }

  /**
   * 更新 调整点（拐点）
   * @param render
   * @param graph
   */
  static updateAnchor(render: Types.Render, graph: Konva.Group) {
    const anchors = graph.attrs.anchors ?? []
    const anchorShadows = graph.find('.anchor') ?? []

    const shape = graph.findOne('.graph') as Konva.Line

    if (shape) {
      // 已拐
      let manualPoints = (shape.attrs.manualPoints ?? []) as Types.LineManualPoint[]
      const points = shape.points()

      // 调整点 + 拐点
      const linkPoints = [
        [points[0], points[1]],
        ...manualPoints.sort((a, b) => a.index - b.index).map((o) => [o.x, o.y]),
        [points[points.length - 2], points[points.length - 1]]
      ]

      // 清空 调整点（拐点）,保留 start end
      anchors.splice(2)
      const shadows = anchorShadows.splice(2)
      for (const shadow of shadows) {
        shadow.remove()
        shadow.destroy()
      }

      manualPoints = []

      for (let i = linkPoints.length - 1; i > 0; i--) {
        linkPoints.splice(i, 0, [])
      }

      // 调整点（拐点）
      for (let i = 1; i < linkPoints.length - 1; i++) {
        const anchor = {
          type: graph.attrs.graphType,
          adjustType: 'manual',
          //
          name: 'anchor',
          groupId: graph.id(),
          //
          manualIndex: i,
          adjusted: false
        }

        if (linkPoints[i].length === 0) {
          anchor.adjusted = false

          // 新增
          const prev = linkPoints[i - 1]
          const next = linkPoints[i + 1]

          const circle = new Konva.Circle({
            adjustType: anchor.adjustType,
            anchorType: anchor.type,
            name: anchor.name,
            manualIndex: anchor.manualIndex,
            radius: 0,
            // radius: render.toStageValue(2),
            // fill: 'red',
            //
            x: (prev[0] + next[0]) / 2,
            y: (prev[1] + next[1]) / 2,
            anchor
          })

          graph.add(circle)
        } else {
          anchor.adjusted = true

          // 已拐
          const circle = new Konva.Circle({
            adjustType: anchor.adjustType,
            anchorType: anchor.type,
            name: anchor.name,
            manualIndex: anchor.manualIndex,
            adjusted: true,
            radius: 0,
            // radius: render.toStageValue(2),
            // fill: 'red',
            //
            x: linkPoints[i][0],
            y: linkPoints[i][1],
            anchor
          })

          graph.add(circle)

          manualPoints.push({
            x: linkPoints[i][0],
            y: linkPoints[i][1],
            index: anchor.manualIndex
          })
        }

        anchors.push(anchor)
      }

      shape.setAttr('manualPoints', manualPoints)

      graph.setAttr('anchors', anchors)
    }
  }

  /**
   * 调整之前
   */
  static adjustStart(
    render: Types.Render,
    graph: Konva.Group,
    adjustAnchor: Types.GraphAnchor & { manualIndex?: number; adjusted?: boolean },
    endPoint: Konva.Vector2d
  ) {
    const { x: gx, y: gy } = graph.position()

    const shape = graph.findOne('.graph') as Konva.Line

    if (shape && typeof adjustAnchor.manualIndex === 'number') {
      const manualPoints = (shape.attrs.manualPoints ?? []) as Types.LineManualPoint[]
      if (adjustAnchor.adjusted) {
        // const manualPointIndex = manualPoints.findIndex((o) => o.index === adjustAnchor.manualIndex)
        // if (manualPointIndex > -1) {
        //   manualPoints[manualPointIndex].x = endPoint.x - gx
        //   manualPoints[manualPointIndex].y = endPoint.y - gy
        // }
        // shape.setAttr('manualPoints', manualPoints)
      } else {
        manualPoints.push({
          x: endPoint.x - gx,
          y: endPoint.y - gy,
          index: adjustAnchor.manualIndex
        })
        shape.setAttr('manualPoints', manualPoints)
      }

      // 更新 调整点（拐点）
      Bezier.updateAnchor(render, graph)
    }
  }
}

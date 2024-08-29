import _ from 'lodash-es'
import Konva from 'konva'

import * as Types from '../types'
import * as Draws from '../draws'

import { BaseGraph } from './BaseGraph'

/**
 * 直线、折线
 */
export class Line extends BaseGraph {
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
    const angleInRadians = Math.atan2(sideA, sideB)
    const angleInDegrees = angleInRadians * (180 / Math.PI)
    return angleInDegrees
  }

  // 实现：生成 调整点
  static override createAnchorShape(
    render: Types.Render,
    graph: Konva.Group,
    anchor: Types.GraphAnchor,
    anchorShadow: Konva.Circle,
    adjustType: string,
    adjustGroupId: string
  ): Konva.Shape | undefined {
    // stage 状态
    const stageState = render.getStageState()

    const shape = graph.findOne('.graph') as Konva.Line

    if (shape) {
      let rotate = 0

      const points = shape.points()
      if (anchor.adjustType === 'start') {
        rotate = Line.calculateAngle(points[2] - points[0], points[3] - points[1])
      } else if (anchor.adjustType === 'end') {
        rotate = Line.calculateAngle(
          points[points.length - 2] - points[points.length - 4],
          points[points.length - 1] - points[points.length - 3]
        )
      }

      const x = render.toStageValue(anchorShadow.getAbsolutePosition().x - stageState.x),
        y = render.toStageValue(anchorShadow.getAbsolutePosition().y - stageState.y)

      const cos = Math.cos((rotate * Math.PI) / 180)
      const sin = Math.sin((rotate * Math.PI) / 180)

      const offset = render.toStageValue(render.pointSize + 5)

      const offsetX = offset * sin
      const offsetY = offset * cos

      const anchorShape = new Konva.Circle({
        name: 'anchor',
        anchor: anchor,
        //
        fill:
          adjustType === anchor.adjustType && graph.id() === adjustGroupId
            ? 'rgba(0,0,255,0.8)'
            : 'rgba(0,0,255,0.2)',
        radius: render.toStageValue(3),
        strokeWidth: 0,
        // 位置
        x: x,
        y: y,
        offsetX:
          anchor.adjustType === 'start' ? offsetX : anchor.adjustType === 'end' ? -offsetX : 0,
        offsetY:
          anchor.adjustType === 'start' ? offsetY : anchor.adjustType === 'end' ? -offsetY : 0,
        // 旋转角度
        rotation: graph.getAbsoluteRotation()
      })

      anchorShape.on('mouseenter', () => {
        anchorShape.fill('rgba(0,0,255,0.8)')
        document.body.style.cursor = 'move'
      })
      anchorShape.on('mouseleave', () => {
        anchorShape.fill(anchorShape.attrs.adjusting ? 'rgba(0,0,255,0.8)' : 'rgba(0,0,255,0.2)')
        document.body.style.cursor = anchorShape.attrs.adjusting ? 'move' : 'default'
      })

      return anchorShape
    }
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
    shapeRecord: Types.GraphAnchorShape,
    shapeRecords: Types.GraphAnchorShape[],
    startPoint: Konva.Vector2d,
    endPoint: Konva.Vector2d
  ) {
    // 目标 直线、折线
    const line = graph.findOne('.graph') as Konva.Line
    // 镜像
    const lineSnap = graphSnap.findOne('.graph') as Konva.Line

    // 调整点 锚点
    const anchors = (graph.find('.anchor') ?? []) as Konva.Circle[]
    // 镜像
    const anchorsSnap = (graphSnap.find('.anchor') ?? []) as Konva.Circle[]

    // 连接点 锚点
    const linkAnchors = (graph.find('.link-anchor') ?? []) as Konva.Circle[]

    const { shape: adjustShape } = shapeRecord

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

        const { x: sx, y: sy } = Line.rotatePoint(ex, ey, centerX, centerY, -graphRotation)
        const { x: rx, y: ry } = Line.rotatePoint(x, y, centerX, centerY, -graphRotation)

        const anchorShadow = anchorsSnap.find((o) => o.attrs.adjustType === adjustType)

        if (anchorShadow) {
          {
            const points = line.points()
            switch (adjustType) {
              case 'start':
                {
                  points.shift()
                  points.shift()
                  line.points([sx - rx, sy - ry].concat(...points))
                }
                break
              case 'end':
                {
                  points.pop()
                  points.pop()
                  line.points(points.concat([sx - rx, sy - ry]))
                }
                break
            }
          }
        }
      }

      // 更新 调整点 的 锚点 位置
      Line.updateAnchorShadows(graph, anchors, line)

      // 更新 图形 的 连接点 的 锚点位置
      Line.updateLinkAnchorShadows(graph, linkAnchors, line)

      // 更新 调整点 位置
      for (const anchor of anchors) {
        for (const { shape } of shapeRecords) {
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

      // 重绘
      render.redraw([Draws.GraphDraw.name, Draws.LinkDraw.name, Draws.PreviewDraw.name])
    }
  }
  /**
   * 默认图形大小
   */
  static size = 100
  /**
   * 直线、折线 对应的 Konva 实例
   */
  private line: Konva.Line

  constructor(render: Types.Render, dropPoint: Konva.Vector2d) {
    super(render, dropPoint, {
      // 定义了 2 个 调整点
      anchors: [{ adjustType: 'start' }, { adjustType: 'end' }].map((o) => ({
        adjustType: o.adjustType, // 调整点 类型定义
        type: Types.GraphType.Line // 记录所属 图形
      })),
      linkAnchors: [
        { x: 0, y: 0, alias: 'start' },
        { x: 0, y: 0, alias: 'end' }
      ] as Types.AssetInfoPoint[]
    })

    // 新建 直线、折线
    this.line = new Konva.Line({
      name: 'graph',
      x: 0,
      y: 0,
      stroke: 'black',
      strokeWidth: 1,
      hitStrokeWidth: render.toStageValue(5)
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

    // 直线、折线 路径
    this.line.points(
      _.flatten([
        [this.line.x(), this.line.y()],
        [this.line.x() + offsetX, this.line.y() + offsetY]
      ])
    )

    // 更新 图形 的 调整点 的 锚点位置
    Line.updateAnchorShadows(this.group, this.anchorShadows, this.line)

    // 更新 图形 的 连接点 的 锚点位置
    Line.updateLinkAnchorShadows(this.group, this.linkAnchorShadows, this.line)

    // 重绘
    this.render.redraw([Draws.GraphDraw.name, Draws.LinkDraw.name, Draws.PreviewDraw.name])
  }

  // 实现：拖动结束
  override drawEnd(): void {
    if (this.line.width() <= 1 && this.line.height() <= 1) {
      // 加入只点击，无拖动

      // 默认大小
      const width = Line.size,
        height = width

      // 直线、折线 位置大小
      this.line.points(
        _.flatten([
          [this.line.x(), this.line.y()],
          [this.line.x() + width, this.line.y() + height]
        ])
      )

      // 更新 图形 的 调整点 的 锚点位置
      Line.updateAnchorShadows(this.group, this.anchorShadows, this.line)

      // 更新 图形 的 连接点 的 锚点位置
      Line.updateLinkAnchorShadows(this.group, this.linkAnchorShadows, this.line)

      // 对齐线清除
      this.render.attractTool.alignLinesClear()

      // 更新历史
      this.render.updateHistory()

      // 重绘
      this.render.redraw([Draws.GraphDraw.name, Draws.LinkDraw.name, Draws.PreviewDraw.name])
    }
  }
}

import _ from 'lodash-es'
import Konva from 'konva'

import * as Types from '../types'
import * as Draws from '../draws'

// const colorMap: { [index: string]: string } = {
//   'top-left': 'rgba(255,0,0,0.2)',
//   top: 'rgba(0,255,0,0.3)',
//   'top-right': 'rgba(0,0,255,0.4)',
//   right: 'rgba(255,0,255,0.5)',
//   'bottom-right': 'rgba(255,0,0,0.6)',
//   bottom: 'rgba(0,255,0,0.7)',
//   'bottom-left': 'rgba(0,0,255,0.8)',
//   left: 'rgba(255,0,255,0.9)'
// }

/**
 * 图形 圆/椭圆
 */
export class Circle extends Types.BaseGraph {
  // 实现：更新 图形 的 调整点 的 锚点位置
  static override updateAnchorShadows(
    width: number,
    height: number,
    rotate: number,
    anchorShadows: Konva.Circle[]
  ): void {
    for (const shadow of anchorShadows) {
      switch (shadow.attrs.id) {
        case 'top':
          shadow.position({
            x: width / 2,
            y: 0
          })
          break
        case 'bottom':
          shadow.position({
            x: width / 2,
            y: height
          })
          break
        case 'left':
          shadow.position({
            x: 0,
            y: height / 2
          })
          break
        case 'right':
          shadow.position({
            x: width,
            y: height / 2
          })
          break
        case 'top-left':
          shadow.position({
            x: 0,
            y: 0
          })
          break
        case 'top-right':
          shadow.position({
            x: width,
            y: 0
          })
          break
        case 'bottom-left':
          shadow.position({
            x: 0,
            y: height
          })
          break
        case 'bottom-right':
          shadow.position({
            x: width,
            y: height
          })
          break
      }
    }
  }
  // 实现：更新 图形 的 连接点 的 锚点位置
  static override updateLinkAnchorShadows(
    width: number,
    height: number,
    rotate: number,
    linkAnchorShadows: Konva.Circle[]
  ): void {
    for (const shadow of linkAnchorShadows) {
      switch (shadow.attrs.alias) {
        case 'top':
          shadow.position({
            x: width / 2,
            y: 0
          })
          break
        case 'bottom':
          shadow.position({
            x: width / 2,
            y: height
          })
          break
        case 'left':
          shadow.position({
            x: 0,
            y: height / 2
          })
          break
        case 'right':
          shadow.position({
            x: width,
            y: height / 2
          })
          break
        case 'center':
          shadow.position({
            x: width / 2,
            y: height / 2
          })
          break
      }
    }
  }
  // 实现：生成 调整点
  static createAnchorShape(
    render: Types.Render,
    graph: Konva.Group,
    anchor: Types.GraphAnchor,
    anchorShadow: Konva.Circle,
    adjustingId: string
  ): Konva.Shape {
    // stage 状态
    const stageState = render.getStageState()

    const x = render.toStageValue(anchorShadow.getAbsolutePosition().x - stageState.x),
      y = render.toStageValue(anchorShadow.getAbsolutePosition().y - stageState.y)

    const offset = render.pointSize + 5

    const shape = new Konva.Line({
      name: 'anchor',
      anchor: anchor,
      //
      // stroke: colorMap[anchor.id] ?? 'rgba(0,0,255,0.2)',
      stroke: adjustingId === anchor.id ? 'rgba(0,0,255,0.8)' : 'rgba(0,0,255,0.2)',
      strokeWidth: render.toStageValue(2),
      // 位置
      x,
      y,
      // 路径
      points:
        {
          'top-left': _.flatten([
            [-offset, offset / 2],
            [-offset, -offset],
            [offset / 2, -offset]
          ]),
          top: _.flatten([
            [-offset, -offset],
            [offset, -offset]
          ]),
          'top-right': _.flatten([
            [-offset / 2, -offset],
            [offset, -offset],
            [offset, offset / 2]
          ]),
          right: _.flatten([
            [offset, -offset],
            [offset, offset]
          ]),
          'bottom-right': _.flatten([
            [-offset / 2, offset],
            [offset, offset],
            [offset, -offset / 2]
          ]),
          bottom: _.flatten([
            [-offset, offset],
            [offset, offset]
          ]),
          'bottom-left': _.flatten([
            [-offset, -offset / 2],
            [-offset, offset],
            [offset / 2, offset]
          ]),
          left: _.flatten([
            [-offset, -offset],
            [-offset, offset]
          ])
        }[anchor.id] ?? [],
      // 旋转角度
      rotation: graph.getAbsoluteRotation()
    })

    shape.on('mouseenter', () => {
      shape.stroke('rgba(0,0,255,0.8)')
      document.body.style.cursor = 'move'
    })
    shape.on('mouseleave', () => {
      shape.stroke(shape.attrs.adjusting ? 'rgba(0,0,255,0.8)' : 'rgba(0,0,255,0.2)')
      document.body.style.cursor = shape.attrs.adjusting ? 'move' : 'default'
    })

    return shape
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
    // 目标 圆/椭圆
    const circle = graph.findOne('.graph') as Konva.Ellipse
    // 镜像
    const circleSnap = graphSnap.findOne('.graph') as Konva.Ellipse

    // 调整点 锚点
    const anchors = (graph.find('.anchor') ?? []) as Konva.Circle[]

    // 连接点 锚点
    const linkAnchors = (graph.find('.link-anchor') ?? []) as Konva.Circle[]

    const { shape: adjustShape } = shapeRecord

    if (circle && circleSnap) {
      let [graphWidth, graphHeight] = [graph.width(), graph.height()]
      const [graphRotation, anchorId, ex, ey] = [
        Math.round(graph.rotation()),
        adjustShape.attrs.anchor?.id,
        endPoint.x,
        endPoint.y
      ]

      let anchorShadow: Konva.Circle | undefined, anchorShadowAcross: Konva.Circle | undefined

      switch (anchorId) {
        case 'top':
          {
            anchorShadow = graphSnap.findOne(`#top`)
            anchorShadowAcross = graphSnap.findOne(`#bottom`)
          }
          break
        case 'bottom':
          {
            anchorShadow = graphSnap.findOne(`#bottom`)
            anchorShadowAcross = graphSnap.findOne(`#top`)
          }
          break
        case 'left':
          {
            anchorShadow = graphSnap.findOne(`#left`)
            anchorShadowAcross = graphSnap.findOne(`#right`)
          }
          break
        case 'right':
          {
            anchorShadow = graphSnap.findOne(`#right`)
            anchorShadowAcross = graphSnap.findOne(`#left`)
          }
          break
        case 'top-left':
          {
            anchorShadow = graphSnap.findOne(`#top-left`)
            anchorShadowAcross = graphSnap.findOne(`#bottom-right`)
          }
          break
        case 'top-right':
          {
            anchorShadow = graphSnap.findOne(`#top-right`)
            anchorShadowAcross = graphSnap.findOne(`#bottom-left`)
          }
          break
        case 'bottom-left':
          {
            anchorShadow = graphSnap.findOne(`#bottom-left`)
            anchorShadowAcross = graphSnap.findOne(`#top-right`)
          }
          break
        case 'bottom-right':
          {
            anchorShadow = graphSnap.findOne(`#bottom-right`)
            anchorShadowAcross = graphSnap.findOne(`#top-left`)
          }
          break
      }

      if (anchorShadow && anchorShadowAcross) {
        const { x: sx, y: sy } = anchorShadow.getAbsolutePosition()
        const { x: ax, y: ay } = anchorShadowAcross.getAbsolutePosition()

        // 调整大小
        {
          const d1 = Math.sqrt(Math.pow(sx - ax, 2) + Math.pow(sy - ay, 2))
          const d2 = Math.sqrt(Math.pow(ex - ax, 2) + Math.pow(ey - ay, 2))
          const r1 = d2 / d1

          let zeroWidth = 1,
            zeroHeight = 1

          switch (anchorId) {
            case 'top':
              {
                if (graphRotation >= 45 && graphRotation < 135) {
                  zeroHeight = ex <= ax ? 0 : 1
                } else if (graphRotation >= -135 && graphRotation < -45) {
                  zeroHeight = ex >= ax ? 0 : 1
                } else if (graphRotation >= -45 && graphRotation < 45) {
                  zeroHeight = ey >= ay ? 0 : 1
                } else {
                  zeroHeight = ey <= ay ? 0 : 1
                }
              }
              break
            case 'bottom':
              {
                if (graphRotation >= 45 && graphRotation < 135) {
                  zeroHeight = ex <= ax ? 1 : 0
                } else if (graphRotation >= -135 && graphRotation < -45) {
                  zeroHeight = ex >= ax ? 1 : 0
                } else if (graphRotation >= -45 && graphRotation < 45) {
                  zeroHeight = ey >= ay ? 1 : 0
                } else {
                  zeroHeight = ey <= ay ? 1 : 0
                }
              }
              break
            case 'left':
              {
                if (graphRotation >= 45 && graphRotation < 135) {
                  zeroWidth = ey >= ay ? 0 : 1
                } else if (graphRotation >= -135 && graphRotation < -45) {
                  zeroWidth = ex <= ax ? 0 : 1
                } else if (graphRotation >= -45 && graphRotation < 45) {
                  zeroWidth = ex >= ax ? 0 : 1
                } else {
                  zeroWidth = ey <= ay ? 0 : 1
                }
              }
              break
            case 'right':
              {
                if (graphRotation >= 45 && graphRotation < 135) {
                  zeroWidth = ey >= ay ? 1 : 0
                } else if (graphRotation >= -135 && graphRotation < -45) {
                  zeroWidth = ex <= ax ? 1 : 0
                } else if (graphRotation >= -45 && graphRotation < 45) {
                  zeroWidth = ex >= ax ? 1 : 0
                } else {
                  zeroWidth = ey <= ay ? 1 : 0
                }
              }
              break
            case 'top-left':
              {
                if (graphRotation > -45 && graphRotation < 45) {
                  if (ex >= ax && ey >= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === 45) {
                  if (ey >= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation > 45 && graphRotation < 135) {
                  if (ex <= ax && ey >= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === 135) {
                  if (ex <= ax) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (
                  (graphRotation > 135 && graphRotation <= 180) ||
                  (graphRotation >= -180 && graphRotation < -135)
                ) {
                  if (ex <= ax && ey <= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === -135) {
                  if (ey <= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation > -135 && graphRotation < -45) {
                  if (ex >= ax && ey <= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === -45) {
                  if (ex >= ax) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                }
              }
              break
            case 'top-right':
              {
                if (graphRotation > -45 && graphRotation < 45) {
                  if (ex <= ax && ey >= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === 45) {
                  if (ex <= ax) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation > 45 && graphRotation < 135) {
                  if (ex <= ax && ey <= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === 135) {
                  if (ey <= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (
                  (graphRotation > 135 && graphRotation <= 180) ||
                  (graphRotation >= -180 && graphRotation < -135)
                ) {
                  if (ex >= ax && ey <= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === -135) {
                  if (ex >= ax) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation > -135 && graphRotation < -45) {
                  if (ex >= ax && ey >= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === -45) {
                  if (ey >= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                }
              }
              break
            case 'bottom-left':
              {
                if (graphRotation > -45 && graphRotation < 45) {
                  if (ex >= ax && ey <= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === 45) {
                  if (ex >= ax) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation > 45 && graphRotation < 135) {
                  if (ex >= ax && ey >= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === 135) {
                  if (ey >= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (
                  (graphRotation > 135 && graphRotation <= 180) ||
                  (graphRotation >= -180 && graphRotation < -135)
                ) {
                  if (ex <= ax && ey >= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === -135) {
                  if (ex <= ax) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation > -135 && graphRotation < -45) {
                  if (ex <= ax && ey <= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === -45) {
                  if (ey <= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                }
              }
              break
            case 'bottom-right':
              {
                if (graphRotation > -45 && graphRotation < 45) {
                  if (ex <= ax && ey <= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === 45) {
                  if (ey <= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation > 45 && graphRotation < 135) {
                  if (ex >= ax && ey <= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === 135) {
                  if (ex >= ax) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (
                  (graphRotation > 135 && graphRotation <= 180) ||
                  (graphRotation >= -180 && graphRotation < -135)
                ) {
                  if (ex >= ax && ey >= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === -135) {
                  if (ey >= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation > -135 && graphRotation < -45) {
                  if (ex <= ax && ey >= ay) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                } else if (graphRotation === -45) {
                  if (ex <= ax) {
                    zeroWidth = 0
                    zeroHeight = 0
                  } else {
                    zeroWidth = 1
                    zeroHeight = 1
                  }
                }
              }
              break
          }

          if (/-?(left|right)$/.test(anchorId)) {
            graph.width(Math.max(2, graphSnap.width() * r1 * zeroWidth))
            graphWidth = graph.width()
          }

          if (/^(top|bottom)-?/.test(anchorId)) {
            graph.height(Math.max(2, graphSnap.height() * r1 * zeroHeight))
            graphHeight = graph.height()
          }
        }

        // 调整位置
        {
          const cos = Math.cos((graphRotation * Math.PI) / 180)
          const sin = Math.sin((graphRotation * Math.PI) / 180)
          const tan = Math.tan((graphRotation * Math.PI) / 180)

          switch (anchorId) {
            case 'top':
              {
                graph.x(ax - (graphWidth / 2 - graphHeight * tan) * cos)
                if (graphRotation !== 90 && graphRotation !== -90) {
                  graph.y(ay - (graphHeight / cos + (graphWidth / 2 - graphHeight * tan) * sin))
                }
              }
              break
            case 'bottom':
              {
                // 无需处理
              }
              break
            case 'left':
              {
                console.log(graphRotation, graphWidth, graphHeight)
                if ([90, -90].includes(graphRotation)) {
                  graph.y(ay - graphWidth)
                } else if (Math.abs(graphRotation) === 180) {
                  graph.x(ax + graphWidth)
                } else {
                  const v1 = graphHeight / 2 / cos
                  const v2 = v1 * sin
                  const v3 = graphWidth - v2
                  const v4 = v3 * sin

                  graph.x(ax - v3 * cos)
                  graph.y(ay - (v1 + v4))
                }
              }
              break
            case 'right':
              {
                // 无需处理
              }
              break
            case 'top-left':
              {
                graph.x(ax - (graphWidth - graphHeight * tan) * cos)
                graph.y(ay - (graphWidth * sin + graphHeight * cos))
              }
              break
            case 'top-right':
              {
                graph.x(ax + graphHeight * sin)
                graph.y(ay - graphHeight * cos)
              }
              break
            case 'bottom-left':
              {
                graph.x(ax - graphWidth * cos)
                graph.y(ay - graphWidth * sin)
              }
              break
            case 'bottom-right':
              {
                // 无需处理
              }
              break
          }
        }
      }

      // 更新 圆/椭圆 大小
      circle.x(graphWidth / 2)
      circle.radiusX(graphWidth / 2)
      circle.y(graphHeight / 2)
      circle.radiusY(graphHeight / 2)

      // 扩大事件触发区域
      circle.hitFunc((context) => {
        context.beginPath()
        context.rect(
          -graphWidth / 2 - render.pointSize - 5 * 2,
          -graphHeight / 2 - render.pointSize - 5 * 2,
          (graphWidth / 2 + render.pointSize + 5 * 2) * 2,
          (graphHeight / 2 + render.pointSize + 5 * 2) * 2
        )
        context.closePath()

        context.fillStrokeShape(circle)
      })

      // 更新 调整点 的 锚点 位置
      Circle.updateAnchorShadows(graphWidth, graphHeight, graphRotation, anchors)

      // 更新 图形 的 连接点 的 锚点位置
      Circle.updateLinkAnchorShadows(graphWidth, graphHeight, graphRotation, linkAnchors)

      // stage 状态
      const stageState = render.getStageState()

      // 更新 调整点 位置
      for (const anchor of anchors) {
        for (const { shape } of shapeRecords) {
          if (shape.attrs.anchor?.id === anchor.attrs.id) {
            const anchorShadow = graph.findOne(`#${anchor.attrs.id}`)
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
  }
  /**
   * 默认图形大小
   */
  static size = 100
  /**
   * 圆/椭圆 对应的 Konva 实例
   */
  private circle: Konva.Ellipse

  constructor(render: Types.Render, dropPoint: Konva.Vector2d) {
    super(render, dropPoint, {
      // 定义了 8 个 调整点
      anchors: [
        { id: 'top' },
        { id: 'bottom' },
        { id: 'left' },
        { id: 'right' },
        { id: 'top-left' },
        { id: 'top-right' },
        { id: 'bottom-left' },
        { id: 'bottom-right' }
      ].map((o) => ({
        id: o.id, // 调整点 类型定义
        type: Types.GraphType.Circle // 记录所属 图形
      })),
      linkAnchors: [
        { x: 0, y: 0, alias: 'top', direction: 'top' },
        { x: 0, y: 0, alias: 'bottom', direction: 'bottom' },
        { x: 0, y: 0, alias: 'left', direction: 'left' },
        { x: 0, y: 0, alias: 'right', direction: 'right' },
        { x: 0, y: 0, alias: 'center' }
      ] as Types.AssetInfoPoint[]
    })

    // 新建 圆/椭圆
    this.circle = new Konva.Ellipse({
      name: 'graph',
      x: 0,
      y: 0,
      radiusX: 0,
      radiusY: 0,
      stroke: 'black',
      strokeWidth: 1
    })

    // 加入
    this.group.add(this.circle)
    // 鼠标按下位置 作为起点
    this.group.position(this.dropPoint)
  }

  // 实现：拖动进行时
  override drawMove(point: Konva.Vector2d): void {
    // 鼠标拖动偏移量
    let offsetX = point.x - this.dropPoint.x,
      offsetY = point.y - this.dropPoint.y

    // 确保不翻转
    if (offsetX < 1) {
      offsetX = 1
    }
    if (offsetY < 1) {
      offsetY = 1
    }

    // 半径
    const radiusX = offsetX / 2,
      radiusY = offsetY / 2

    // 圆/椭圆 位置大小
    this.circle.x(radiusX)
    this.circle.y(radiusY)
    this.circle.radiusX(radiusX)
    this.circle.radiusY(radiusY)

    // group 大小
    this.group.size({
      width: offsetX,
      height: offsetY
    })

    // 更新 图形 的 调整点 的 锚点位置
    Circle.updateAnchorShadows(offsetX, offsetY, 1, this.anchorShadows)

    // 更新 图形 的 连接点 的 锚点位置
    Circle.updateLinkAnchorShadows(offsetX, offsetY, 1, this.linkAnchorShadows)

    // 重绘
    this.render.redraw([Draws.GraphDraw.name, Draws.LinkDraw.name])
  }

  // 实现：拖动结束
  override drawEnd(): void {
    if (this.circle.radiusX() <= 1 && this.circle.radiusY() <= 1) {
      // 加入只点击，无拖动

      // 默认大小
      const width = Circle.size,
        height = width

      const radiusX = Circle.size / 2,
        radiusY = radiusX

      // 圆/椭圆 位置大小
      this.circle.x(radiusX)
      this.circle.y(radiusY)
      this.circle.radiusX(radiusX - this.circle.strokeWidth())
      this.circle.radiusY(radiusY - this.circle.strokeWidth())

      // 扩大事件触发区域
      this.circle.hitFunc((context) => {
        context.beginPath()
        context.rect(
          -radiusX - this.render.pointSize - 5 * 2,
          -radiusY - this.render.pointSize - 5 * 2,
          (radiusX + this.render.pointSize + 5 * 2) * 2,
          (radiusY + this.render.pointSize + 5 * 2) * 2
        )
        context.closePath()

        context.fillStrokeShape(this.circle)
      })

      // group 大小
      this.group.size({
        width,
        height
      })

      // 更新 图形 的 调整点 的 锚点位置
      Circle.updateAnchorShadows(width, height, 1, this.anchorShadows)

      // 更新 图形 的 连接点 的 锚点位置
      Circle.updateLinkAnchorShadows(width, height, 1, this.linkAnchorShadows)

      // 对齐线清除
      this.render.attractTool.alignLinesClear()

      // 重绘
      this.render.redraw([Draws.GraphDraw.name, Draws.LinkDraw.name])
    }
  }
}

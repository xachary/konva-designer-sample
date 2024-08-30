import _ from 'lodash-es'
import Konva from 'konva'

import * as Types from '../types'
import * as Draws from '../draws'

import { BaseGraph } from './BaseGraph'

/**
 * 图形 矩形
 */
export class Rect extends BaseGraph {
  // 实现：更新 图形 的 调整点 的 锚点位置
  static override updateAnchorShadows(graph: Konva.Group, anchorShadows: Konva.Circle[]): void {
    const { width, height } = graph.size()
    //
    for (const shadow of anchorShadows) {
      switch (shadow.attrs.adjustType) {
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
    graph: Konva.Group,
    linkAnchorShadows: Konva.Circle[]
  ): void {
    const { width, height } = graph.size()
    //
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

    const x = render.toStageValue(anchorShadow.getAbsolutePosition().x - stageState.x),
      y = render.toStageValue(anchorShadow.getAbsolutePosition().y - stageState.y)

    const offset = render.toStageValue(render.pointSize + 5)

    const anchorShape = new Konva.Line({
      name: 'anchor',
      anchor: anchor,
      //
      // stroke: colorMap[anchor.adjustType] ?? 'rgba(0,0,255,0.2)',
      stroke:
        adjustType === anchor.adjustType && graph.id() === adjustGroupId
          ? 'rgba(0,0,255,0.8)'
          : 'rgba(0,0,255,0.2)',
      strokeWidth: render.toStageValue(2),
      hitStrokeWidth: render.toStageValue(3),
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
        }[anchor.adjustType] ?? [],
      // 旋转角度
      rotation: graph.getAbsoluteRotation()
    })

    anchorShape.on('mouseenter', () => {
      anchorShape.stroke('rgba(0,0,255,0.8)')
      document.body.style.cursor = 'move'
    })
    anchorShape.on('mouseleave', () => {
      anchorShape.stroke(anchorShape.attrs.adjusting ? 'rgba(0,0,255,0.8)' : 'rgba(0,0,255,0.2)')
      document.body.style.cursor = anchorShape.attrs.adjusting ? 'move' : 'default'
    })

    return anchorShape
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
    // 目标 矩形
    const rect = graph.findOne('.graph') as Konva.Rect
    // 镜像
    const rectSnap = graphSnap.findOne('.graph') as Konva.Rect

    // 调整点 锚点
    const anchors = (graph.find('.anchor') ?? []) as Konva.Circle[]
    // 镜像
    const anchorsSnap = (graphSnap.find('.anchor') ?? []) as Konva.Circle[]

    // 连接点 锚点
    const linkAnchors = (graph.find('.link-anchor') ?? []) as Konva.Circle[]

    const { shape: adjustShape } = shapeRecord

    if (rect && rectSnap) {
      const [graphRotation, adjustType, ex, ey] = [
        Math.round(graph.rotation()),
        adjustShape.attrs.anchor?.adjustType,
        endPoint.x,
        endPoint.y
      ]

      let anchorShadow: Konva.Circle | undefined, anchorShadowAcross: Konva.Circle | undefined

      switch (adjustType) {
        case 'top':
          {
            anchorShadow = anchorsSnap.find((o) => o.attrs.adjustType === 'top')
            anchorShadowAcross = anchorsSnap.find((o) => o.attrs.adjustType === 'bottom')
          }
          break
        case 'bottom':
          {
            anchorShadow = anchorsSnap.find((o) => o.attrs.adjustType === 'bottom')
            anchorShadowAcross = anchorsSnap.find((o) => o.attrs.adjustType === 'top')
          }
          break
        case 'left':
          {
            anchorShadow = anchorsSnap.find((o) => o.attrs.adjustType === 'left')
            anchorShadowAcross = anchorsSnap.find((o) => o.attrs.adjustType === 'right')
          }
          break
        case 'right':
          {
            anchorShadow = anchorsSnap.find((o) => o.attrs.adjustType === 'right')
            anchorShadowAcross = anchorsSnap.find((o) => o.attrs.adjustType === 'left')
          }
          break
        case 'top-left':
          {
            anchorShadow = anchorsSnap.find((o) => o.attrs.adjustType === 'top-left')
            anchorShadowAcross = anchorsSnap.find((o) => o.attrs.adjustType === 'bottom-right')
          }
          break
        case 'top-right':
          {
            anchorShadow = anchorsSnap.find((o) => o.attrs.adjustType === 'top-right')
            anchorShadowAcross = anchorsSnap.find((o) => o.attrs.adjustType === 'bottom-left')
          }
          break
        case 'bottom-left':
          {
            anchorShadow = anchorsSnap.find((o) => o.attrs.adjustType === 'bottom-left')
            anchorShadowAcross = anchorsSnap.find((o) => o.attrs.adjustType === 'top-right')
          }
          break
        case 'bottom-right':
          {
            anchorShadow = anchorsSnap.find((o) => o.attrs.adjustType === 'bottom-right')
            anchorShadowAcross = anchorsSnap.find((o) => o.attrs.adjustType === 'top-left')
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

          switch (adjustType) {
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

          if (/-?(left|right)$/.test(adjustType)) {
            graph.width(Math.max(2, graphSnap.width() * r1 * zeroWidth))
          }

          if (/^(top|bottom)-?/.test(adjustType)) {
            graph.height(Math.max(2, graphSnap.height() * r1 * zeroHeight))
          }
        }

        // 调整位置
        {
          const [graphWidth, graphHeight] = [
            graph.width() * graph.scaleX(),
            graph.height() * graph.scaleY()
          ]

          const cos = Math.cos((graphRotation * Math.PI) / 180)
          const sin = Math.sin((graphRotation * Math.PI) / 180)
          const tan = Math.tan((graphRotation * Math.PI) / 180)

          switch (adjustType) {
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

      const [graphWidth, graphHeight] = [graph.width(), graph.height()]

      // 更新 矩形 大小
      rect.width(graphWidth)
      rect.height(graphHeight)

      // 更新 调整点 的 锚点 位置
      Rect.updateAnchorShadows(graph, anchors)

      // 更新 图形 的 连接点 的 锚点位置
      Rect.updateLinkAnchorShadows(graph, linkAnchors)

      // stage 状态
      const stageState = render.getStageState()

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
   * 提供给 GraphDraw draw 使用
   * @param graph 
   * @param render 
   * @param adjustType 
   * @param adjustGroupId 
   * @returns 
   */
  static override draw(
    graph: Konva.Group,
    render: Types.Render,
    adjustType: string,
    adjustGroupId: string
  ) {
    // 调整点 及其 锚点
    const { anchorAndShadows } = super.draw(graph, render, adjustType, adjustGroupId)

    for (const anchorAndShadow of anchorAndShadows) {
      const shape = Rect.createAnchorShape(
        render,
        graph,
        anchorAndShadow.anchor,
        anchorAndShadow.anchorShadow,
        adjustType,
        adjustGroupId
      )

      anchorAndShadow.shape = shape
    }

    return { anchorAndShadows }
  }

  /**
   * 默认图形大小
   */
  static size = 100
  /**
   * 矩形 对应的 Konva 实例
   */
  private rect: Konva.Rect

  constructor(render: Types.Render, dropPoint: Konva.Vector2d) {
    super(render, dropPoint, {
      type: Types.GraphType.Rect, // 记录所属 图形
      // 定义了 8 个 调整点
      anchors: [
        { adjustType: 'top' },
        { adjustType: 'bottom' },
        { adjustType: 'left' },
        { adjustType: 'right' },
        { adjustType: 'top-left' },
        { adjustType: 'top-right' },
        { adjustType: 'bottom-left' },
        { adjustType: 'bottom-right' }
      ].map((o) => ({
        adjustType: o.adjustType // 调整点 类型定义
      })),
      linkAnchors: [
        { x: 0, y: 0, alias: 'top', direction: 'top' },
        { x: 0, y: 0, alias: 'bottom', direction: 'bottom' },
        { x: 0, y: 0, alias: 'left', direction: 'left' },
        { x: 0, y: 0, alias: 'right', direction: 'right' },
        { x: 0, y: 0, alias: 'center' }
      ] as Types.AssetInfoPoint[]
    })

    // 新建 矩形
    this.rect = new Konva.Rect({
      name: 'graph',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      stroke: 'black',
      strokeWidth: 1
    })

    // 加入
    this.group.add(this.rect)
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

    // 矩形 位置大小
    this.rect.width(offsetX)
    this.rect.height(offsetY)

    // group 大小
    this.group.size({
      width: offsetX,
      height: offsetY
    })

    // 更新 图形 的 调整点 的 锚点位置
    Rect.updateAnchorShadows(this.group, this.anchorShadows)

    // 更新 图形 的 连接点 的 锚点位置
    Rect.updateLinkAnchorShadows(this.group, this.linkAnchorShadows)

    // 重绘
    this.render.redraw([Draws.GraphDraw.name, Draws.LinkDraw.name, Draws.PreviewDraw.name])
  }

  // 实现：拖动结束
  override drawEnd(): void {
    if (this.rect.width() <= 1 && this.rect.height() <= 1) {
      // 加入只点击，无拖动

      // 默认大小
      const width = Rect.size,
        height = width

      // 矩形 位置大小
      this.rect.width(width - this.rect.strokeWidth())
      this.rect.height(height - this.rect.strokeWidth())

      // group 大小
      this.group.size({
        width,
        height
      })

      // 更新 图形 的 调整点 的 锚点位置
      Rect.updateAnchorShadows(this.group, this.anchorShadows)

      // 更新 图形 的 连接点 的 锚点位置
      Rect.updateLinkAnchorShadows(this.group, this.linkAnchorShadows)

      // 对齐线清除
      this.render.attractTool.alignLinesClear()

      // 更新历史
      this.render.updateHistory()

      // 重绘
      this.render.redraw([Draws.GraphDraw.name, Draws.LinkDraw.name, Draws.PreviewDraw.name])
    }
  }
}

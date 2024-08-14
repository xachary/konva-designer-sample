import Konva from 'konva'

import * as Types from '../types'
import * as Draws from '../draws'

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
  // 实现：调整 图形
  static adjust(
    render: Types.Render,
    graph: Konva.Group,
    graphSnap: Konva.Group,
    rect: Konva.Rect,
    rects: Konva.Rect[],
    startPoint: Konva.Vector2d,
    endPoint: Konva.Vector2d
  ) {
    // 目标 圆/椭圆
    const circle = graph.findOne('.graph') as Konva.Ellipse
    // 镜像
    const circleSnap = graphSnap.findOne('.graph') as Konva.Ellipse

    // 调整点
    const anchors = (graph.find('.anchor') ?? []) as Konva.Circle[]

    if (circle && circleSnap) {
      // 鼠标偏移量
      const offsetX = endPoint.x - startPoint.x
      const offsetY = endPoint.y - startPoint.y

      // 三角函数
      const cos = Math.cos((graph.rotation() * Math.PI) / 180)
      const tan = Math.tan((graph.rotation() * Math.PI) / 180)

      // 三角函数 计算
      switch (rect.attrs.anchor?.id) {
        case 'top':
          graph.y(Math.min(graphSnap.y() + graphSnap.height() + 2, graphSnap.y() + offsetY))
          graph.x(graphSnap.x() - offsetY * tan)
          graph.height(Math.max(2, graphSnap.height() - (cos === 0 ? 0 : offsetY / cos)))
          break
        case 'bottom':
          graph.height(Math.max(2, graphSnap.height() + (cos === 0 ? 0 : offsetY / cos)))
          break
        case 'left':
          graph.x(Math.min(graphSnap.x() + graphSnap.width() + 2, graphSnap.x() + offsetX))
          graph.y(graphSnap.y() + offsetX * tan)
          graph.width(Math.max(2, graphSnap.width() - (cos === 0 ? 0 : offsetX / cos)))
          break
        case 'right':
          graph.width(Math.max(2, graphSnap.width() + (cos === 0 ? 0 : offsetX / cos)))
          break
        case 'top-left':
          graph.x(Math.min(graphSnap.x() + graphSnap.width() + 2, graphSnap.x() + offsetX))
          graph.y(Math.min(graphSnap.y() + graphSnap.height() + 2, graphSnap.y() + offsetY))
          graph.width(Math.max(2, graphSnap.width() - (cos === 0 ? 0 : offsetX / cos)))
          graph.height(Math.max(2, graphSnap.height() - (cos === 0 ? 0 : offsetY / cos)))
          break
        case 'top-right':
          graph.y(Math.min(graphSnap.y() + graphSnap.height() + 2, graphSnap.y() + offsetY))
          graph.width(Math.max(2, graphSnap.width() + (cos === 0 ? 0 : offsetX / cos)))
          graph.height(Math.max(2, graphSnap.height() - (cos === 0 ? 0 : offsetY / cos)))
          break
        case 'bottom-left':
          graph.x(Math.min(graphSnap.x() + graphSnap.width() + 2, graphSnap.x() + offsetX))
          graph.width(Math.max(2, graphSnap.width() - (cos === 0 ? 0 : offsetX / cos)))
          graph.height(Math.max(2, graphSnap.height() + (cos === 0 ? 0 : offsetY / cos)))
          break
        case 'bottom-right':
          graph.width(Math.max(2, graphSnap.width() + (cos === 0 ? 0 : offsetX / cos)))
          graph.height(Math.max(2, graphSnap.height() + (cos === 0 ? 0 : offsetY / cos)))
          break
      }

      // 更新 圆/椭圆 大小
      circle.x(graph.width() / 2)
      circle.radiusX(graph.width() / 2)
      circle.y(graph.height() / 2)
      circle.radiusY(graph.height() / 2)


      // 更新 调整点 的 锚点 位置
      Circle.updateAnchorShadows(graph.width(), graph.height(), graph.rotation(), anchors)

      // stage 状态
      const stageState = render.getStageState()

      // 更新 调整点 位置
      for (const anchor of anchors) {
        for (const item of rects) {
          if (item.attrs.anchor?.id === anchor.attrs.id) {
            const anchorShadow = graph.findOne(`#${anchor.attrs.id}`)
            if (anchorShadow) {
              item.position({
                x: render.toStageValue(anchorShadow.getAbsolutePosition().x - stageState.x),
                y: render.toStageValue(anchorShadow.getAbsolutePosition().y - stageState.y)
              })
              item.rotation(graph.getAbsoluteRotation())
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
      }))
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

    // 重绘
    this.render.redraw([Draws.GraphDraw.name])
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
      
      // group 大小
      this.group.size({
        width,
        height
      })

      // 更新 图形 的 调整点 的 锚点位置
      Circle.updateAnchorShadows(width, height, 1, this.anchorShadows)

      // 重绘
      this.render.redraw([Draws.GraphDraw.name])
    }
  }
}

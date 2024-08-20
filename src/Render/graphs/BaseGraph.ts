import Konva from 'konva'
import { nanoid } from 'nanoid'

import { Render } from '../index'
import * as Types from '../types'

/**
 * 图形类
 * 实例主要用于新建图形时，含新建同时的大小拖动。
 * 静态方法主要用于新建之后，通过 调整点 调整的逻辑定义
 */
export abstract class BaseGraph {
  /**
   * 更新 图形 的 调整点 的 锚点位置
   * @param width 图形 的 宽度
   * @param height 图形 的 高度
   * @param rotate 图形 的 旋转角度
   * @param anchorShadows 图形 的 调整点 的 锚点
   */
  static updateAnchorShadows(
    width: number,
    height: number,
    rotate: number,
    anchorShadows: Konva.Circle[]
  ) {
    console.log('请实现 updateAnchorShadows', width, height, anchorShadows)
  }

  /**
   * 更新 图形 的 连接点 的 锚点位置
   * @param width 图形 的 宽度
   * @param height 图形 的 高度
   * @param rotate 图形 的 旋转角度
   * @param anchors 图形 的 调整点 的 锚点
   */
  static updateLinkAnchorShadows(
    width: number,
    height: number,
    rotate: number,
    linkAnchorShadows: Konva.Circle[]
  ) {
    console.log('请实现 updateLinkAnchorShadows', width, height, linkAnchorShadows)
  }

  // static pointsVisible(render: Render, visible: boolean, group?: Konva.Group) {
  //   // 所有图形
  //   const groups = render.layer
  //     .find('.asset')
  //     .filter((o) => (group ? o === group : o.attrs.assetType === Types.AssetType.Graph)) as Konva.Group[]

  //   for (const group of groups) {
  //     const anchors = group.attrs.anchors ?? []
  //     group.setAttrs({
  //       anchors: anchors.map((o: Types.GraphAnchor) => ({ ...o, visible }))
  //     })
  //   }

  //   if (!visible) {
  //     document.body.style.cursor = 'default'
  //   }

  //   // 重绘
  //   render.redraw(['Graph'])
  // }

  /**
   * 生成 调整点
   * @param render 渲染实例
   * @param graph 图形
   * @param anchor 调整点 定义
   * @param anchorShadow 调整点 锚点
   * @param adjustType 正在操作的 调整点 类型
   * @returns
   */
  static createAnchorShape(
    render: Render,
    graph: Konva.Group,
    anchor: Types.GraphAnchor,
    anchorShadow: Konva.Circle,
    adjustType: string
  ): Konva.Shape {
    console.log('请实现 createAnchorShape', render, graph, anchor, anchorShadow, adjustType)
    return new Konva.Shape()
  }

  /**
   * 调整 图形
   * @param render 渲染实例
   * @param graph 图形
   * @param graphSnap 图形 的 备份
   * @param rect 当前 调整点
   * @param rects 所有 调整点
   * @param startPoint 鼠标按下位置
   * @param endPoint 鼠标拖动位置
   */
  static adjust(
    render: Render,
    graph: Konva.Group,
    graphSnap: Konva.Group,
    rect: Types.GraphAnchorShape,
    rects: Types.GraphAnchorShape[],
    startPoint: Konva.Vector2d,
    endPoint: Konva.Vector2d
  ) {
    console.log('请实现 updateAnchorShadows', render, graph, rect, startPoint, endPoint)
  }
  //
  protected render: Render
  group: Konva.Group
  id: string // 就是 group 的id
  /**
   * 鼠标按下位置
   */
  protected dropPoint: Konva.Vector2d = { x: 0, y: 0 }
  /**
   * 调整点 定义
   */
  protected anchors: Types.GraphAnchor[] = []
  /**
   * 调整点 的 锚点
   */
  protected anchorShadows: Konva.Circle[] = []

  /**
   * 调整点 定义
   */
  protected linkAnchors: Types.LinkDrawPoint[] = []
  /**
   * 连接点 的 锚点
   */
  protected linkAnchorShadows: Konva.Circle[] = []

  constructor(
    render: Render,
    dropPoint: Konva.Vector2d,
    config: {
      anchors: Types.GraphAnchor[]
      linkAnchors: Types.AssetInfoPoint[]
    }
  ) {
    this.render = render
    this.dropPoint = dropPoint

    this.id = nanoid()

    this.group = new Konva.Group({
      id: this.id,
      name: 'asset',
      assetType: Types.AssetType.Graph
    })

    // 调整点 定义
    this.anchors = config.anchors.map((o) => ({
      ...o,
      // 补充信息
      name: 'anchor',
      groupId: this.group.id()
    }))

    // 记录在 group 中
    this.group.setAttr('anchors', this.anchors)

    // 新建 调整点 的 锚点
    for (const anchor of this.anchors) {
      const circle = new Konva.Circle({
        adjustType: anchor.adjustType,
        name: anchor.name,
        radius: 0
        // radius: this.render.toStageValue(1),
        // fill: 'red'
      })
      this.anchorShadows.push(circle)
      this.group.add(circle)
    }

    // 连接点 定义
    this.linkAnchors = config.linkAnchors.map(
      (o) =>
        ({
          ...o,
          id: nanoid(),
          groupId: this.group.id(),
          visible: false,
          pairs: [],
          direction: o.direction,
          alias: o.alias
        }) as Types.LinkDrawPoint
    )

    // 连接点信息
    this.group.setAttrs({
      points: this.linkAnchors
    })
    // 新建 连接点 的 锚点
    for (const point of this.linkAnchors) {
      const circle = new Konva.Circle({
        name: 'link-anchor',
        id: point.id,
        x: point.x,
        y: point.y,
        radius: this.render.toStageValue(1),
        stroke: 'rgba(0,0,255,1)',
        strokeWidth: this.render.toStageValue(2),
        visible: false,
        direction: point.direction,
        alias: point.alias
      })
      this.linkAnchorShadows.push(circle)
      this.group.add(circle)
    }

    this.group.on('mouseenter', () => {
      // 显示 连接点
      this.render.linkTool.pointsVisible(true, this.group)
    })
    this.group.on('mouseleave', () => {
      // 隐藏 连接点
      this.render.linkTool.pointsVisible(false, this.group)
      // 隐藏 hover 框
      this.group.findOne('#hoverRect')?.visible(false)
    })

    this.render.layer.add(this.group)

    this.render.redraw()
  }

  /**
   * 调整进行时
   * @param point 鼠标位置 相对位置
   */
  abstract drawMove(point: Konva.Vector2d): void

  /**
   * 调整结束
   */
  abstract drawEnd(): void
}

import _ from 'lodash-es'
import Konva from 'konva'
//
import * as Types from '../types'
import * as Graphs from '../graphs'

export interface GraphDrawState {
  /**
   * 调整中
   */
  adjusting: boolean
  /**
   * 当前 调整点 类型
   */
  adjustingId: string
}

export class GraphDraw extends Types.BaseDraw implements Types.Draw {
  static override readonly name = 'Graph'

  option: {}

  on = {}

  /**
   * 调整点 大小
   */
  static anchorSize = 16

  state: GraphDrawState = {
    adjusting: false,
    adjustingId: ''
  }

  /**
   * 鼠标按下 调整点 位置
   */
  startPoint: Konva.Vector2d = { x: 0, y: 0 }

  /**
   * 图形 group 镜像
   */
  graphSnap: Konva.Group | undefined

  constructor(render: Types.Render, layer: Konva.Layer, option: any) {
    super(render, layer)

    this.option = option

    this.group.name(this.constructor.name)
  }

  /**
   * 获取鼠标位置，并处理为 相对大小
   * @param attract 含磁贴计算
   * @returns
   */
  getStagePoint(attract = false) {
    const pos = this.render.stage.getPointerPosition()
    if (pos) {
      const stageState = this.render.getStageState()
      // 磁贴
      const { pos: transformerPos } = this.render.attractTool.attract({
        x: pos.x,
        y: pos.y,
        width: 1,
        height: 1
      })
      if (attract) {
        return {
          x: this.render.toStageValue(transformerPos.x - stageState.x),
          y: this.render.toStageValue(transformerPos.y - stageState.y)
        }
      } else {
        return {
          x: this.render.toStageValue(pos.x - stageState.x),
          y: this.render.toStageValue(pos.y - stageState.y)
        }
      }
    }
    return null
  }

  // 调整 预处理、定位静态方法
  adjust(graph: Konva.Group, rect: Konva.Rect, rects: Konva.Rect[]) {
    // 鼠标按下
    rect.on('mousedown', () => {
      this.state.adjusting = true
      this.state.adjustingId = rect.attrs.anchor?.id

      const pos = this.getStagePoint()
      if (pos) {
        // 使 调整点 中点位置 与 鼠标按下 位置重合（否则磁贴不准）
        this.startPoint = {
          x: pos.x + (rect.x() - pos.x),
          y: pos.y + (rect.y() - pos.y)
        }

        // 图形 group 镜像，用于计算位置、大小的偏移
        this.graphSnap = graph.clone()
      }
    })

    // 调整中
    this.render.stage.on('mousemove', () => {
      if (this.state.adjusting && this.graphSnap) {
        if (rect.attrs.anchor?.type === Types.GraphType.Circle) {
          // 调整 圆/椭圆 图形
          if (rect.attrs.anchor?.id === this.state.adjustingId) {
            const pos = this.getStagePoint(true)
            if (pos) {
              // 使用 圆/椭圆 静态处理方法
              Graphs.Circle.adjust(
                this.render,
                graph,
                this.graphSnap,
                rect,
                rects,
                this.startPoint,
                pos
              )
            }
          }
        }
      }
    })

    // 调整结束
    this.render.stage.on('mouseup', () => {
      this.state.adjusting = false
      this.state.adjustingId = ''

      // 恢复显示所有 调整点
      for (const item of rects) {
        item.opacity(1)
      }

      // 销毁 镜像
      this.graphSnap?.destroy()
    })
  }

  override draw() {
    this.clear()

    // stage 状态
    const stageState = this.render.getStageState()

    // 所有图形
    const graphs = this.render.layer.find('.graph') as Konva.Group[]

    for (const graph of graphs) {
      // 非选中状态才显示 调整点
      if (!this.render.selectionTool.selectingNodes.includes(graph)) {
        const anchors = (graph.attrs.anchors ?? []) as Types.GraphAnchor[]
        const rects: Konva.Rect[] = []

        // 根据 调整点 信息，创建
        for (const anchor of anchors) {
          // 调整点 的显示 依赖其隐藏的 锚点 位置、大小等信息
          const anchorShadow = graph.findOne(`#${anchor.id}`)
          if (anchorShadow) {
            const rect = new Konva.Rect({
              name: 'anchor',
              anchor: anchor,
              // 中点居中
              offsetX: this.render.toStageValue(GraphDraw.anchorSize) / 2,
              offsetY: this.render.toStageValue(GraphDraw.anchorSize) / 2,
              // 位置
              x: this.render.toStageValue(anchorShadow.getAbsolutePosition().x - stageState.x),
              y: this.render.toStageValue(anchorShadow.getAbsolutePosition().y - stageState.y),
              // 旋转角度
              rotation: graph.getAbsoluteRotation(),
              //
              stroke: 'rgba(0,0,255,0.1)',
              strokeWidth: this.render.toStageValue(1),
              // 大小
              width: this.render.toStageValue(GraphDraw.anchorSize),
              height: this.render.toStageValue(GraphDraw.anchorSize),
              // 调整中，则只显示该 调整点
              opacity: this.state.adjustingId ? (anchor.id === this.state.adjustingId ? 1 : 0) : 1
            })

            // 调整点 的 hover 效果
            rect.on('mouseenter', () => {
              rect.stroke('rgba(0,0,255,0.8)')
              document.body.style.cursor = 'pointer'
            })
            rect.on('mouseleave', () => {
              rect.stroke('rgba(0,0,255,0.1)')
              document.body.style.cursor = 'default'
            })

            this.group.add(rect)

            rects.push(rect)

            // 调整 预处理
            this.adjust(graph, rect, rects)
          }
        }
      }
    }
  }
}

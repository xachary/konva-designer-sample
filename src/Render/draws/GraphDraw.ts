import Konva from 'konva'
//
import * as Types from '../types'
import * as Graphs from '../graphs'

export interface GraphDrawState {
  /**
   * 调整中
   */
  adjusting: boolean
}

export class GraphDraw extends Types.BaseDraw implements Types.Draw {
  static override readonly name = 'Graph'

  option: {}

  on = {}

  /**
   * 调整点 大小
   */
  static anchorSize = 8

  state: GraphDrawState = {
    adjusting: false
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
      if (attract) {
        // 磁贴
        const { pos: transformerPos } = this.render.attractTool.attractPoint(pos)
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
  adjusts(
    shapeDetailList: {
      graph: Konva.Group
      shapeRecords: { shape: Konva.Shape; anchorShadow: Konva.Circle }[]
    }[]
  ) {
    for (const { shapeRecords, graph } of shapeDetailList) {
      for (const { shape } of shapeRecords) {
        shape.setAttr('adjusting', false)
      }
      for (const shapeRecord of shapeRecords) {
        const { shape } = shapeRecord
        // 鼠标按下
        shape.on('mousedown', () => {
          this.state.adjusting = true
          shape.setAttr('adjusting', true)

          const pos = this.getStagePoint()
          if (pos) {
            this.startPoint = pos

            // 图形 group 镜像，用于计算位置、大小的偏移
            this.graphSnap = graph.clone()
          }
        })

        // 调整中
        this.render.stage.on('mousemove', () => {
          if (this.state.adjusting && this.graphSnap) {
            if (shape.attrs.anchor?.type === Types.GraphType.Circle) {
              // 调整 圆/椭圆 图形
              if (shape.attrs.adjusting) {
                const pos = this.getStagePoint(true)
                if (pos) {
                  // 使用 圆/椭圆 静态处理方法
                  Graphs.Circle.adjust(
                    this.render,
                    graph,
                    this.graphSnap,
                    shapeRecord,
                    shapeRecords,
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

          // 恢复显示所有 调整点
          for (const { shape } of shapeRecords) {
            shape.opacity(1)
            shape.setAttr('adjusting', false)
            shape.stroke('rgba(0,0,255,0.2)')
            document.body.style.cursor = 'default'
          }

          // 销毁 镜像
          this.graphSnap?.destroy()

          // 对齐线清除
          this.render.attractTool.alignLinesClear()
        })

        this.group.add(shape)
      }
    }
  }

  override draw() {
    this.clear()

    // 所有图形
    const graphs = this.render.layer
      .find('.asset')
      .filter((o) => o.attrs.assetType === Types.AssetType.Graph) as Konva.Group[]

    const shapeDetailList: {
      graph: Konva.Group
      shapeRecords: { shape: Konva.Shape; anchorShadow: Konva.Circle }[]
    }[] = []

    for (const graph of graphs) {
      // 非选中状态才显示 调整点
      if (!graph.attrs.selected) {
        const anchors = (graph.attrs.anchors ?? []) as Types.GraphAnchor[]
        const shapeRecords: { shape: Konva.Shape; anchorShadow: Konva.Circle }[] = []

        // 根据 调整点 信息，创建
        for (const anchor of anchors) {
          // 调整点 的显示 依赖其隐藏的 锚点 位置、大小等信息
          const anchorShadow = graph.findOne(`#${anchor.id}`) as Konva.Circle
          if (anchorShadow) {
            const shape = Graphs.Circle.createAnchorShape(this.render, graph, anchor, anchorShadow)

            shapeRecords.push({ shape, anchorShadow })
          }
        }

        shapeDetailList.push({
          graph,
          shapeRecords
        })
      }
    }

    this.adjusts(shapeDetailList)
  }
}

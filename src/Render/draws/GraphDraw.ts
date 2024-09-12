import Konva from 'konva'
//
import * as Types from '../types'
import * as Graphs from '../graphs'
import * as Draws from '../draws'

export interface GraphDrawState {
  /**
   * 调整中
   */
  adjusting: boolean

  /**
   * 调整中 id
   */
  adjustGroupId: string

  /**
   * 调整中 调整点
   */
  adjustAnchor?: Types.GraphAnchor

  /**
   * 鼠标按下 调整点 位置
   */
  startPointCurrent: Konva.Vector2d

  /**
   * 图形 group
   */
  graphCurrent?: Konva.Group

  /**
   * 图形 group 镜像，用于计算位置、大小的偏移
   */
  graphCurrentSnap?: Konva.Group
}

export interface GraphDrawOption {
  //
}

export class GraphDraw extends Types.BaseDraw implements Types.Draw {
  static override readonly name = 'Graph'

  option: {}

  on = {}

  state: GraphDrawState = {
    adjusting: false,
    adjustGroupId: '',
    startPointCurrent: { x: 0, y: 0 }
  }

  constructor(render: Types.Render, layer: Konva.Layer, option: GraphDrawOption) {
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

  override draw() {
    this.clear()
    // 所有图形
    const graphs = this.render.layer
      .find('.asset')
      .filter((o) => o.attrs.assetType === Types.AssetType.Graph) as Konva.Group[]

    for (const graph of graphs) {
      // 非选中状态才显示 调整点
      if (!graph.attrs.selected) {
        let anchorAndShadows: {
          anchor: Types.GraphAnchor
          anchorShadow: Konva.Circle
          shape?: Konva.Shape | undefined
        }[] = []

        switch (graph.attrs.graphType) {
          case Types.GraphType.Circle:
            {
              const res = Graphs.Circle.draw(graph, this.render, this.state.adjustAnchor)

              anchorAndShadows = res.anchorAndShadows
            }
            break
          case Types.GraphType.Rect:
            {
              const res = Graphs.Rect.draw(graph, this.render, this.state.adjustAnchor)

              anchorAndShadows = res.anchorAndShadows
            }
            break
          case Types.GraphType.Line:
            {
              const res = Graphs.Line.draw(graph, this.render, this.state.adjustAnchor)

              anchorAndShadows = res.anchorAndShadows
            }
            break

          case Types.GraphType.Curve:
            {
              const res = Graphs.Curve.draw(graph, this.render, this.state.adjustAnchor)

              anchorAndShadows = res.anchorAndShadows
            }
            break
        }

        for (const anchorAndShadow of anchorAndShadows) {
          const { shape } = anchorAndShadow

          if (shape) {
            // 鼠标按下
            shape.on('mousedown', () => {
              const pos = this.getStagePoint()
              if (pos) {
                this.state.adjusting = true
                this.state.adjustAnchor = shape.attrs.anchor
                this.state.adjustGroupId = graph.id()

                this.state.startPointCurrent = pos

                this.state.graphCurrent = graph
                this.state.graphCurrentSnap = graph.clone()

                shape.setAttr('adjusting', true)

                if (this.state.adjustAnchor) {
                  switch (shape.attrs.anchor?.type) {
                    case Types.GraphType.Line:
                      // 使用 直线、折线 静态处理方法
                      Graphs.Line.adjustStart(this.render, graph, this.state.adjustAnchor, pos)
                      break
                    case Types.GraphType.Curve:
                      // 使用 直线、折线 静态处理方法
                      Graphs.Curve.adjustStart(this.render, graph, this.state.adjustAnchor, pos)
                      break
                  }
                }
              }
            })

            // 调整中
            this.render.stage.on('mousemove', () => {
              if (this.state.adjusting && this.state.graphCurrent && this.state.graphCurrentSnap) {
                if (shape.attrs.adjusting) {
                  // 调整 圆/椭圆 图形
                  const pos = this.getStagePoint(true)
                  if (pos) {
                    switch (shape.attrs.anchor?.type) {
                      case Types.GraphType.Circle:
                        // 使用 圆/椭圆 静态处理方法
                        Graphs.Circle.adjust(
                          this.render,
                          graph,
                          this.state.graphCurrentSnap,
                          shape,
                          anchorAndShadows,
                          this.state.startPointCurrent,
                          pos
                        )
                        break
                      case Types.GraphType.Rect:
                        // 使用 圆/椭圆 静态处理方法
                        Graphs.Rect.adjust(
                          this.render,
                          graph,
                          this.state.graphCurrentSnap,
                          shape,
                          anchorAndShadows,
                          this.state.startPointCurrent,
                          pos
                        )
                        break
                      case Types.GraphType.Line:
                        // 使用 直线、折线 静态处理方法
                        Graphs.Line.adjust(
                          this.render,
                          graph,
                          this.state.graphCurrentSnap,
                          shape,
                          anchorAndShadows,
                          this.state.startPointCurrent,
                          pos
                        )
                        break
                      case Types.GraphType.Curve:
                        // 使用 直线、折线 静态处理方法
                        Graphs.Curve.adjust(
                          this.render,
                          graph,
                          this.state.graphCurrentSnap,
                          shape,
                          anchorAndShadows,
                          this.state.startPointCurrent,
                          pos
                        )
                        break
                    }

                    // 重绘
                    this.render.redraw([
                      Draws.GraphDraw.name,
                      Draws.LinkDraw.name,
                      Draws.PreviewDraw.name
                    ])
                  }
                }
              }
            })

            // 调整结束
            this.render.stage.on('mouseup', () => {
              if (shape.attrs.adjusting) {
                // 更新历史
                this.render.updateHistory()

                // 重绘
                this.render.redraw([
                  Draws.GraphDraw.name,
                  Draws.LinkDraw.name,
                  Draws.PreviewDraw.name
                ])
              }
              this.state.adjusting = false
              this.state.adjustAnchor = undefined
              this.state.adjustGroupId = ''

              // 恢复显示所有 调整点
              for (const { shape } of anchorAndShadows) {
                if (shape) {
                  shape.opacity(1)
                  shape.setAttr('adjusting', false)
                  if (
                    [Types.GraphType.Line, Types.GraphType.Curve].includes(shape.attrs.anchor?.type)
                  ) {
                    if (shape.attrs.anchor.adjusted) {
                      shape.fill('rgba(0,0,0,0.4)')
                    } else {
                      shape.fill('rgba(0,0,255,0.2)')
                    }
                  } else {
                    shape.stroke('rgba(0,0,255,0.2)')
                  }
                }

                document.body.style.cursor = 'default'
              }

              // 销毁 镜像
              this.state.graphCurrentSnap?.destroy()

              // 对齐线清除
              this.render.attractTool.alignLinesClear()
            })

            this.group.add(shape)
          }
        }
      }
    }
  }
}

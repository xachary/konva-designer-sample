import Konva from 'konva'
//
import { Render } from '../index'
import * as Types from '../types'
import * as Graphs from '../graphs'

export class GraphHandlers implements Types.Handler {
  static readonly name = 'Graph'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  /**
   * 新建图形中
   */
  graphing = false

  /**
   * 当前新建图形类型
   */
  currentGraph: Types.BaseGraph | undefined

  /**
   * 获取鼠标位置，并处理为 相对大小
   * @returns
   */
  getStagePoint() {
    const pos = this.render.stage.getPointerPosition()
    if (pos) {
      const stageState = this.render.getStageState()
      const point = {
        x: this.render.toStageValue(pos.x - stageState.x),
        y: this.render.toStageValue(pos.y - stageState.y)
      }
      return point
    }
    return null
  }

  handlers = {
    stage: {
      mousedown: (e: Konva.KonvaEventObject<GlobalEventHandlersEventMap['mousedown']>) => {
        if (this.render.graphType) {
          // 选中图形类型，开始

          if (e.target === this.render.stage) {
            this.graphing = true

            this.render.selectionTool.selectingClear()

            const point = this.getStagePoint()
            if (point) {
              if (this.render.graphType === Types.GraphType.Circle) {
                // 新建 圆/椭圆 实例
                this.currentGraph = new Graphs.Circle(this.render, point)
              }
            }
          }
        }
      },
      mousemove: () => {
        if (this.graphing) {
          if (this.currentGraph) {
            const point = this.getStagePoint()
            if (point) {
              // 新建并马上调整图形
              this.currentGraph.drawMove(point)
            }
          }
        }
      },
      mouseup: () => {
        if (this.graphing) {
          if (this.currentGraph) {
            // 调整结束
            this.currentGraph.drawEnd()
          }

          // 调整结束
          this.graphing = false
          
          // 清空图形类型选择
          this.render.changeGraphType()
        }
      }
    }
  }
}

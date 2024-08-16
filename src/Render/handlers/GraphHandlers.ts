import Konva from 'konva'
//
import { Render } from '../index'
import * as Types from '../types'
import * as Graphs from '../graphs'
import * as Draws from '../draws'

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
            const pos = this.getStagePoint(true)
            if (pos) {
              // 新建并马上调整图形
              this.currentGraph.drawMove(pos)
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

          // 对齐线清除
          this.render.attractTool.alignLinesClear()

          // 重绘
          this.render.redraw([Draws.GraphDraw.name])
        }
      }
    }
  }
}

import Konva from 'konva'
//
import { Render } from '../index'
import * as Types from '../types'
import * as Draws from '../draws'

export class DragHandlers implements Types.Handler {
  static readonly name = 'Drag'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  // 右键是否按下
  mousedownRight = false
  // 右键按下 stage 位置
  mousedownStagePos = { x: 0, y: 0 }
  // 右键按下位置
  mousedownPointerPos = { x: 0, y: 0 }

  handlers = {
    stage: {
      mousedown: (e: Konva.KonvaEventObject<GlobalEventHandlersEventMap['mousedown']>) => {
        // 拐点操作中，防止异常拖动
        // 新建图形并拖动中
        if (
          !(this.render.draws[Draws.LinkDraw.name] as Draws.LinkDraw).state.linkManualing &&
          !this.render.graphType
        ) {
          if (
            e.evt.button === Types.MouseButton.右键 ||
            (e.evt.ctrlKey && e.evt.button === Types.MouseButton.左键) // mac 拖动画布快捷键
          ) {
            // stage 状态
            const stageState = this.render.getStageState()

            // 鼠标右键
            this.mousedownRight = true

            this.mousedownStagePos = { x: stageState.x, y: stageState.y }

            const pos = this.render.stage.getPointerPosition()
            if (pos) {
              this.mousedownPointerPos = { x: pos.x, y: pos.y }
            }

            document.body.style.cursor = 'pointer'
          }
        }
      },
      mouseup: () => {
        this.mousedownRight = false

        document.body.style.cursor = 'default'
      },
      mousemove: () => {
        if (this.mousedownRight) {
          // 鼠标右键拖动
          const pos = this.render.stage.getPointerPosition()
          if (pos) {
            const offsetX = pos.x - this.mousedownPointerPos.x
            const offsetY = pos.y - this.mousedownPointerPos.y

            // 移动 stage
            this.render.stage.position({
              x: this.mousedownStagePos.x + offsetX,
              y: this.mousedownStagePos.y + offsetY
            })

            // 重绘
            this.render.redraw([
              Draws.BgDraw.name,
              Draws.GraphDraw.name,
              Draws.LinkDraw.name,
              Draws.RulerDraw.name,
              Draws.PreviewDraw.name
            ])
          }
        }
      }
    }
  }
}

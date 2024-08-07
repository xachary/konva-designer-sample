import { Render } from '../index'
//
import * as Draws from '../draws'

export class PositionTool {
  static readonly name = 'PositionTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  // 恢复位置大小
  positionZoomReset() {
    this.render.stage.setAttrs({
      scale: { x: 1, y: 1 }
    })

    this.positionReset()
  }

  // 恢复位置
  positionReset() {
    this.render.stage.setAttrs({
      x: this.render.rulerSize,
      y: this.render.rulerSize
    })

    // 重绘
    this.render.redraw([
      Draws.BgDraw.name,
      Draws.LinkDraw.name,
      Draws.RulerDraw.name,
      Draws.RefLineDraw.name,
      Draws.PreviewDraw.name
    ])
  }

  // 更新中心位置
  updateCenter(x = 0, y = 0) {
    // stage 状态
    const stageState = this.render.getStageState()

    // 提取节点
    const nodes = this.render.layer.getChildren((node) => {
      return !this.render.ignore(node)
    })

    // 计算节点占用的区域（计算起点即可）
    let minX = 0
    let minY = 0
    for (const node of nodes) {
      const x = node.x()
      const y = node.y()

      if (x < minX) {
        minX = x
      }
      if (y < minY) {
        minY = y
      }
    }

    // 居中画布
    this.render.stage.setAttrs({
      x:
        stageState.width / 2 -
        this.render.toBoardValue(minX) -
        this.render.toBoardValue(x) +
        this.render.rulerSize,
      y:
        stageState.height / 2 -
        this.render.toBoardValue(minY) -
        this.render.toBoardValue(y) +
        this.render.rulerSize
    })

    // 重绘
    this.render.redraw([
      Draws.BgDraw.name,
      Draws.LinkDraw.name,
      Draws.RulerDraw.name,
      Draws.RefLineDraw.name,
      Draws.PreviewDraw.name
    ])
  }
}

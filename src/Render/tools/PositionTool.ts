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

    // 更新背景
    this.render.draws[Draws.BgDraw.name].draw()
    // 更新比例尺
    this.render.draws[Draws.RulerDraw.name].draw()
    // 更新参考线
    this.render.draws[Draws.RefLineDraw.name].draw()
  }
}

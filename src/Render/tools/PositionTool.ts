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
    // 更新预览
    this.render.draws[Draws.PreviewDraw.name].draw()
  }

  // 更新中心位置
  updateCenter(x = 0, y = 0) {
    // stage 状态
    const stageState = this.render.getStageState()

    // 提取节点
    const nodes = this.render.layer.getChildren((node) => {
      return !this.render.ignore(node)
    })

    // 计算节点占用的区域
    let minX = 0
    let maxX = this.render.layer.width()
    let minY = 0
    let maxY = this.render.layer.height()
    for (const node of nodes) {
      const x = node.x()
      const y = node.y()
      const width = node.width()
      const height = node.height()

      if (x < minX) {
        minX = x
      }
      if (x + width > maxX) {
        maxX = x + width
      }
      if (y < minY) {
        minY = y
      }
      if (y + height > maxY) {
        maxY = y + height
      }
    }

    // “指向位置”相对于“区域起点”的距离
    const rx = x + minX
    const ry = y + minY

    // 居中画布
    this.render.stage.setAttrs({
      x: stageState.width / 2 - rx * stageState.scale,
      y: stageState.height / 2 - ry * stageState.scale
    })

    // 更新背景
    this.render.draws[Draws.BgDraw.name].draw()
    // 更新比例尺
    this.render.draws[Draws.RulerDraw.name].draw()
    // 更新参考线
    this.render.draws[Draws.RefLineDraw.name].draw()
    // 更新预览
    this.render.draws[Draws.PreviewDraw.name].draw()
  }
}

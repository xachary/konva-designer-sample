import Konva from 'konva'
//
import { Render } from '../index'
//
import * as Draws from '../draws'

export class LinkTool {
  static readonly name = 'LinkTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  pointsVisibleEach(visible: boolean, group: Konva.Group) {
    const points = group.getAttr('points') ?? []

    group.setAttrs({
      points: points.map((o: any) => ({ ...o, visible }))
    })
  }

  pointsVisible(visible: boolean, group?: Konva.Group) {
    if (group) {
      this.pointsVisibleEach(visible, group)
    } else {
      const groups = this.render.layer.find('.asset') as Konva.Group[]
      for (const group of groups) {
        this.pointsVisibleEach(visible, group)
      }
    }

    // 更新连线
    this.render.draws[Draws.LinkDraw.name].draw()
    // 更新预览
    this.render.draws[Draws.PreviewDraw.name].draw()
  }
}

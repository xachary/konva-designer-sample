import _ from 'lodash-es'
import Konva from 'konva'
//
import * as Types from '../types'

export class AttractDraw extends Types.BaseDraw implements Types.Draw {
  static override readonly name = 'Attract'

  option: {}

  on = {}

  constructor(render: Types.Render, layer: Konva.Layer, option: any) {
    super(render, layer)

    this.option = option

    this.group.name(this.constructor.name)
  }

  override draw() {
    this.clear()

    if (this.render.debug) {
      // stage 状态
      const stageState = this.render.getStageState()

      const groups = this.render.layer.find('.asset') as Konva.Group[]
      const lastGroup = groups.pop()

      if (lastGroup) {
        this.render.selectionTool.selectingNodes = [lastGroup]

        const rect = lastGroup.getClientRect()
        const { sortX, sortY } = this.render.attractTool.getSortItems(rect)
        for (const x of sortX) {
          this.group.add(
            new Konva.Line({
              name: this.constructor.name,
              points: _.flatten([
                [x.value, this.render.toStageValue(this.render.rulerSize - stageState.y)],
                [
                  x.value,
                  this.render.toStageValue(this.render.rulerSize - stageState.y + stageState.height)
                ]
              ]),
              stroke: 'rgba(0,200,0,1)',
              strokeWidth: 1,
              dash: [4, 4],
              listening: false
            })
          )
        }
        for (const y of sortY) {
          this.group.add(
            new Konva.Line({
              name: this.constructor.name,
              points: _.flatten([
                [this.render.toStageValue(this.render.rulerSize - stageState.x), y.value],
                [
                  this.render.toStageValue(this.render.rulerSize - stageState.x + stageState.width),
                  y.value
                ]
              ]),
              stroke: 'rgba(0,200,0,1)',
              strokeWidth: 1,
              dash: [4, 4],
              listening: false
            })
          )
        }
      }
    }
  }
}

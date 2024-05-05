import _ from 'lodash-es'
import Konva from 'konva'
//
import * as Types from '../types'

export interface RefLineDrawOption {
  padding: number
}

export class RefLineDraw extends Types.BaseDraw implements Types.Draw, Types.Handler {
  static override readonly name = 'refLine'

  option: RefLineDrawOption

  constructor(render: Types.Render, layer: Konva.Layer, option: RefLineDrawOption) {
    super(render, layer)

    this.option = option

    this.group.listening(false)
  }

  override draw() {
    if (this.render.config.showRefLine) {
      this.clear()

      // stage 状态
      const stageState = this.render.getStageState()

      const group = new Konva.Group()

      const pos = this.render.stage.getPointerPosition()
      if (pos) {
        if (pos.y >= this.option.padding) {
          // 横
          group.add(
            new Konva.Line({
              name: this.constructor.name,
              points: _.flatten([
                [
                  this.render.toStageValue(-stageState.x),
                  this.render.toStageValue(pos.y - stageState.y)
                ],
                [
                  this.render.toStageValue(stageState.width - stageState.x + this.render.rulerSize),
                  this.render.toStageValue(pos.y - stageState.y)
                ]
              ]),
              stroke: 'rgba(255,0,0,0.2)',
              strokeWidth: this.render.toStageValue(1),
              listening: false
            })
          )
        }

        if (pos.x >= this.option.padding) {
          // 竖
          group.add(
            new Konva.Line({
              name: this.constructor.name,
              points: _.flatten([
                [
                  this.render.toStageValue(pos.x - stageState.x),
                  this.render.toStageValue(-stageState.y)
                ],
                [
                  this.render.toStageValue(pos.x - stageState.x),
                  this.render.toStageValue(stageState.height - stageState.y + this.render.rulerSize)
                ]
              ]),
              stroke: 'rgba(255,0,0,0.2)',
              strokeWidth: this.render.toStageValue(1),
              listening: false
            })
          )
        }
      }
      this.group.add(group)
    }
  }

  handlers = {
    dom: {
      mousemove: () => {
        // 更新参考线
        this.draw()
      },
      mouseout: () => {
        // 清除参考线
        this.clear()
      }
    }
  }
}

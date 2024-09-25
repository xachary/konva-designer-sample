import _ from 'lodash-es'
import Konva from 'konva'
//
import * as Types from '../types'

export interface BgDrawOption {
  size: number
}
export class BgDraw extends Types.BaseDraw implements Types.Draw {
  static override readonly name = 'bg'

  option: BgDrawOption

  constructor(render: Types.Render, layer: Konva.Layer, option: BgDrawOption) {
    super(render, layer)

    this.option = option

    this.group.listening(false)
  }

  override draw() {
    if (this.render.config.showBg) {
      this.clear()

      // stage 状态
      const stageState = this.render.getStageState()

      // 相关参数

      // 格子大小
      const cellSize = this.option.size

      // 列数
      const lenX = Math.ceil(
        this.render.toStageValue(stageState.width + this.render.rulerSize) / cellSize
      )
      // 行数
      const lenY = Math.ceil(
        this.render.toStageValue(stageState.height + this.render.rulerSize) / cellSize
      )

      const startX = -Math.ceil(this.render.toStageValue(stageState.x) / cellSize)
      const startY = -Math.ceil(this.render.toStageValue(stageState.y) / cellSize)

      const group = new Konva.Group()

      group.add(
        new Konva.Rect({
          name: `${this.constructor.name}__background`,
          x: this.render.toStageValue(-stageState.x + this.render.rulerSize),
          y: this.render.toStageValue(-stageState.y + this.render.rulerSize),
          width: this.render.toStageValue(stageState.width),
          height: this.render.toStageValue(stageState.height),
          listening: false,
          fill: this.render.getPageSettings().background
        })
      )

      group.add(
        new Konva.Rect({
          name: this.constructor.name,
          x: 0,
          y: 0,
          width: stageState.width,
          height: stageState.height,
          stroke: 'rgba(255,0,0,0.2)',
          strokeWidth: this.render.toStageValue(2),
          listening: false,
          dash: [this.render.toStageValue(6), this.render.toStageValue(6)]
        })
      )

      // 竖线
      for (let x = startX; x < lenX + startX + 2; x++) {
        group.add(
          new Konva.Line({
            name: this.constructor.name,
            points: _.flatten([
              [cellSize * x, this.render.toStageValue(-stageState.y + this.render.rulerSize)],
              [
                cellSize * x,
                this.render.toStageValue(stageState.height - stageState.y + this.render.rulerSize)
              ]
            ]),
            stroke: '#ddd',
            strokeWidth: this.render.toStageValue(1),
            listening: false
          })
        )
      }

      // 横线
      for (let y = startY; y < lenY + startY + 2; y++) {
        group.add(
          new Konva.Line({
            name: this.constructor.name,
            points: _.flatten([
              [this.render.toStageValue(-stageState.x + this.render.rulerSize), cellSize * y],
              [
                this.render.toStageValue(stageState.width - stageState.x + this.render.rulerSize),
                cellSize * y
              ]
            ]),
            stroke: '#ddd',
            strokeWidth: this.render.toStageValue(1),
            listening: false
          })
        )
      }

      this.group.add(group)
    }
  }
}

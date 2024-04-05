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
      const lenX = Math.ceil(stageState.width / stageState.scale / cellSize)
      // 行数
      const lenY = Math.ceil(stageState.height / stageState.scale / cellSize)

      const startX = -Math.ceil(stageState.x / stageState.scale / cellSize)
      const startY = -Math.ceil(stageState.y / stageState.scale / cellSize)

      const group = new Konva.Group()

      group.add(
        new Konva.Rect({
          name: this.constructor.name,
          x: 0,
          y: 0,
          width: stageState.width,
          height: stageState.height,
          stroke: 'rgba(255,0,0,0.1)',
          strokeWidth: 2 / stageState.scale,
          listening: false,
          dash: [4, 4]
        })
      )

      // 竖线
      for (let x = startX; x < lenX + startX + 1; x++) {
        group.add(
          new Konva.Line({
            name: this.constructor.name,
            points: _.flatten([
              [cellSize * x, -stageState.y / stageState.scale],
              [cellSize * x, (stageState.height - stageState.y) / stageState.scale]
            ]),
            stroke: '#ddd',
            strokeWidth: 1 / stageState.scale,
            listening: false
          })
        )
      }

      // 横线
      for (let y = startY; y < lenY + startY + 1; y++) {
        group.add(
          new Konva.Line({
            name: this.constructor.name,
            points: _.flatten([
              [-stageState.x / stageState.scale, cellSize * y],
              [(stageState.width - stageState.x) / stageState.scale, cellSize * y]
            ]),
            stroke: '#ddd',
            strokeWidth: 1 / stageState.scale,
            listening: false
          })
        )
      }

      this.group.add(group)
    }
  }
}

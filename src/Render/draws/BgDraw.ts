import _ from 'lodash-es'
import Konva from 'konva'
import * as Types from '../types'

export interface BgDrawOption {
  size: number
}
export class BgDraw extends Types.BaseDraw implements Types.Draw {
  static override readonly name = 'bg'

  private option: BgDrawOption

  state = {}

  on = {}

  constructor(
    stage: Konva.Stage,
    config: Types.RenderConfig,
    layer: Konva.Layer,
    option: BgDrawOption
  ) {
    super(stage, config, layer)

    this.option = option
    this.group.listening(false)
  }

  override draw() {
    if (this.config.showBg) {
      this.clear()

      // 相关参数

      // 格子大小
      const cellSize = this.option.size
      //
      const width = this.stage.width()
      const height = this.stage.height()
      const scaleX = this.stage.scaleX()
      const scaleY = this.stage.scaleY()
      const stageX = this.stage.x()
      const stageY = this.stage.y()

      // 列数
      const lenX = Math.ceil(width / scaleX / cellSize)
      // 行数
      const lenY = Math.ceil(height / scaleY / cellSize)

      const startX = -Math.ceil(stageX / scaleX / cellSize)
      const startY = -Math.ceil(stageY / scaleY / cellSize)

      const group = new Konva.Group()

      group.add(
        new Konva.Rect({
          name: this.constructor.name,
          x: 0,
          y: 0,
          width: width,
          height: height,
          stroke: 'rgba(255,0,0,0.1)',
          strokeWidth: 2 / scaleY,
          listening: false,
          dash: [4, 4]
        })
      )

      // 竖线
      for (let x = startX; x < lenX + startX; x++) {
        group.add(
          new Konva.Line({
            name: this.constructor.name,
            points: _.flatten([
              [cellSize * x, -stageY / scaleY],
              [cellSize * x, (height - stageY) / scaleY]
            ]),
            stroke: '#ddd',
            strokeWidth: 1 / scaleY,
            listening: false
          })
        )
      }

      // 横线
      for (let y = startY; y < lenY + startY; y++) {
        group.add(
          new Konva.Line({
            name: this.constructor.name,
            points: _.flatten([
              [-stageX / scaleX, cellSize * y],
              [(width - stageX) / scaleX, cellSize * y]
            ]),
            stroke: '#ddd',
            strokeWidth: 1 / scaleX,
            listening: false
          })
        )
      }

      this.group.add(group)
    }
  }
}

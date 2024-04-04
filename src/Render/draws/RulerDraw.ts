import _ from 'lodash-es'
import Konva from 'konva'
import * as Types from '../types'

export interface RulerDrawOption {
  size: number
}

export class RulerDraw extends Types.BaseDraw implements Types.Draw {
  static override readonly name = 'ruler'

  private option: RulerDrawOption

  state = {}

  on = {}

  constructor(
    stage: Konva.Stage,
    config: Types.RenderConfig,
    layer: Konva.Layer,
    option: RulerDrawOption
  ) {
    super(stage, config, layer)
    this.option = option
  }

  override draw() {
    if (this.config.showRuler) {
      this.clear()

      // 格子大小
      const cellSize = 20

      const width = this.stage.width()
      const height = this.stage.height()
      const scaleX = this.stage.scaleX()
      const scaleY = this.stage.scaleY()
      const stageX = this.stage.x()
      const stageY = this.stage.y()
      const fontSizeMax = 12

      // 列数
      const lenX = Math.ceil(width / scaleX / cellSize)
      // 行数
      const lenY = Math.ceil(height / scaleY / cellSize)

      const startX = -Math.ceil((stageX - this.option.size) / scaleX / cellSize)
      const startY = -Math.ceil((stageY - this.option.size) / scaleY / cellSize)

      const group = new Konva.Group()

      const groupTop = new Konva.Group({
        x: -stageX / scaleX + this.option.size / scaleY,
        y: -stageY / scaleY,
        width: width / scaleX - this.option.size / scaleY,
        height: this.option.size / scaleY
      })
      const groupLeft = new Konva.Group({
        x: -stageX / scaleX,
        y: -stageY / scaleY + this.option.size / scaleX,
        width: this.option.size / scaleX,
        height: height / scaleY - this.option.size / scaleX
      })

      {
        groupTop.add(
          // 上
          new Konva.Rect({
            name: this.constructor.name,
            x: 0,
            y: 0,
            width: groupTop.width(),
            height: groupTop.height(),
            fill: '#ddd'
          })
        )

        for (let x = lenX + startX - 1; x >= startX; x--) {
          const nx = -groupTop.x() + cellSize * x
          const long = (this.option.size / scaleY / 5) * 4
          const short = (this.option.size / scaleY / 5) * 3

          if (nx >= 0) {
            groupTop.add(
              new Konva.Line({
                name: this.constructor.name,
                points: _.flatten([
                  [nx, x % 5 ? long : short],
                  [nx, this.option.size / scaleY]
                ]),
                stroke: '#999',
                strokeWidth: 1 / scaleY,
                listening: false
              })
            )

            if (x % 5 === 0) {
              let fontSize = fontSizeMax

              const text = new Konva.Text({
                name: this.constructor.name,
                y: this.option.size / scaleY / 2 - fontSize / scaleY,
                text: (x * cellSize).toString(),
                fontSize: fontSize / scaleY,
                fill: '#999',
                align: 'center',
                verticalAlign: 'bottom',
                lineHeight: 1.6
              })

              while (text.width() / scaleY > (cellSize / scaleY) * 4.6) {
                fontSize -= 1
                text.fontSize(fontSize / scaleY)
                text.y(this.option.size / scaleY / 2 - fontSize / scaleY)
              }
              text.x(nx - text.width() / 2)
              groupTop.add(text)
            }
          }
        }
      }

      {
        groupLeft.add(
          // 左
          new Konva.Rect({
            name: this.constructor.name,
            x: 0,
            y: 0,
            width: groupLeft.width(),
            height: groupLeft.height(),
            fill: '#ddd'
          })
        )

        for (let y = lenY + startY - 1; y >= startY; y--) {
          const ny = -groupLeft.y() + cellSize * y
          const long = (this.option.size / scaleX / 5) * 4
          const short = (this.option.size / scaleX / 5) * 3

          if (ny >= 0) {
            groupLeft.add(
              new Konva.Line({
                name: this.constructor.name,
                points: _.flatten([
                  [y % 5 ? long : short, ny],
                  [this.option.size / scaleY, ny]
                ]),
                stroke: '#999',
                strokeWidth: 1 / scaleY,
                listening: false
              })
            )

            if (y % 5 === 0) {
              let fontSize = fontSizeMax

              const text = new Konva.Text({
                name: this.constructor.name,
                x: 0,
                y: ny,
                text: (y * cellSize).toString(),
                fontSize: fontSize / scaleX,
                fill: '#999',
                align: 'right',
                verticalAlign: 'bottom',
                lineHeight: 1.6,
                wrap: 'none'
              })

              while (text.width() > short * 0.8) {
                fontSize -= 1
                text.fontSize(fontSize / scaleX)
              }
              text.y(ny - text.height() / 2)
              text.width(short - 1 / scaleX)
              groupLeft.add(text)
            }
          }
        }
      }

      group.add(
        // 角
        new Konva.Rect({
          name: this.constructor.name,
          x: -stageX / scaleX,
          y: -stageY / scaleY,
          width: this.option.size / scaleX,
          height: this.option.size / scaleY,
          fill: '#ddd'
        })
      )
      group.add(
        // 倍率
        new Konva.Text({
          name: this.constructor.name,
          x: -stageX / scaleX,
          y: -stageY / scaleY,
          text: `x${scaleX.toFixed(1)}`,
          fontSize: 14 / scaleX,
          fill: 'blue',
          align: 'center',
          verticalAlign: 'middle',
          width: this.option.size / scaleX,
          height: this.option.size / scaleY
        })
      )

      group.add(groupTop)
      group.add(groupLeft)

      this.group.add(group)
    }
  }
}

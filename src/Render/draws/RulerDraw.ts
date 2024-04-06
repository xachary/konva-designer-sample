import _ from 'lodash-es'
import Konva from 'konva'
//
import * as Types from '../types'

export interface RulerDrawOption {
  size: number
}

export class RulerDraw extends Types.BaseDraw implements Types.Draw {
  static override readonly name = 'ruler'

  option: RulerDrawOption

  constructor(render: Types.Render, layer: Konva.Layer, option: RulerDrawOption) {
    super(render, layer)
    this.option = option
  }

  override draw() {
    if (this.render.config.showRuler) {
      this.clear()

      // stage 状态
      const stageState = this.render.getStageState()

      // 格子大小
      const cellSize = 20

      const fontSizeMax = 12

      // 列数
      const lenX = Math.ceil(this.render.toStageValue(stageState.width) / cellSize)
      // 行数
      const lenY = Math.ceil(this.render.toStageValue(stageState.height) / cellSize)

      const startX = -Math.ceil(
        this.render.toStageValue(stageState.x - this.option.size) / cellSize
      )
      const startY = -Math.ceil(
        this.render.toStageValue(stageState.y - this.option.size) / cellSize
      )

      const group = new Konva.Group()

      const groupTop = new Konva.Group({
        x: this.render.toStageValue(-stageState.x + this.option.size),
        y: this.render.toStageValue(-stageState.y),
        width: this.render.toStageValue(stageState.width - this.option.size),
        height: this.render.toStageValue(this.option.size)
      })
      const groupLeft = new Konva.Group({
        x: this.render.toStageValue(-stageState.x),
        y: this.render.toStageValue(-stageState.y + this.option.size),
        width: this.render.toStageValue(this.option.size),
        height: this.render.toStageValue(stageState.height - this.option.size)
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
          const long = (this.render.toStageValue(this.option.size) / 5) * 4
          const short = (this.render.toStageValue(this.option.size) / 5) * 3

          if (nx >= 0) {
            groupTop.add(
              new Konva.Line({
                name: this.constructor.name,
                points: _.flatten([
                  [nx, x % 5 ? long : short],
                  [nx, this.render.toStageValue(this.option.size)]
                ]),
                stroke: '#999',
                strokeWidth: this.render.toStageValue(1),
                listening: false
              })
            )

            if (x % 5 === 0) {
              let fontSize = fontSizeMax

              const text = new Konva.Text({
                name: this.constructor.name,
                y: this.render.toStageValue(this.option.size / 2 - fontSize),
                text: (x * cellSize).toString(),
                fontSize: this.render.toStageValue(fontSize),
                fill: '#999',
                align: 'center',
                verticalAlign: 'bottom',
                lineHeight: 1.6
              })

              while (
                this.render.toStageValue(text.width()) >
                this.render.toStageValue(cellSize) * 4.6
              ) {
                fontSize -= 1
                text.fontSize(this.render.toStageValue(fontSize))
                text.y(this.render.toStageValue(this.option.size / 2 - fontSize) / 2)
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
          const long = (this.render.toStageValue(this.option.size) / 5) * 4
          const short = (this.render.toStageValue(this.option.size) / 5) * 3

          if (ny >= 0) {
            groupLeft.add(
              new Konva.Line({
                name: this.constructor.name,
                points: _.flatten([
                  [y % 5 ? long : short, ny],
                  [this.render.toStageValue(this.option.size), ny]
                ]),
                stroke: '#999',
                strokeWidth: this.render.toStageValue(1),
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
                fontSize: this.render.toStageValue(fontSize),
                fill: '#999',
                align: 'right',
                verticalAlign: 'bottom',
                lineHeight: 1.6,
                wrap: 'none'
              })

              while (text.width() > short * 0.8) {
                fontSize -= 1
                text.fontSize(this.render.toStageValue(fontSize))
              }
              text.y(ny - text.height() / 2)
              text.width(short - this.render.toStageValue(1))
              groupLeft.add(text)
            }
          }
        }
      }

      group.add(
        // 角
        new Konva.Rect({
          name: this.constructor.name,
          x: this.render.toStageValue(-stageState.x),
          y: this.render.toStageValue(-stageState.y),
          width: this.render.toStageValue(this.option.size),
          height: this.render.toStageValue(this.option.size),
          fill: '#ddd'
        })
      )
      group.add(
        // 倍率
        new Konva.Text({
          name: this.constructor.name,
          x: this.render.toStageValue(-stageState.x),
          y: this.render.toStageValue(-stageState.y),
          text: `x${stageState.scale.toFixed(1)}`,
          fontSize: this.render.toStageValue(14),
          fill: 'blue',
          align: 'center',
          verticalAlign: 'middle',
          width: this.render.toStageValue(this.option.size),
          height: this.render.toStageValue(this.option.size)
        })
      )

      group.add(groupTop)
      group.add(groupLeft)

      this.group.add(group)
    }
  }
}

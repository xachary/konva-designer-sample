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
      const lenX = Math.ceil(stageState.width / stageState.scale / cellSize)
      // 行数
      const lenY = Math.ceil(stageState.height / stageState.scale / cellSize)

      const startX = -Math.ceil((stageState.x - this.option.size) / stageState.scale / cellSize)
      const startY = -Math.ceil((stageState.y - this.option.size) / stageState.scale / cellSize)

      const group = new Konva.Group()

      const groupTop = new Konva.Group({
        x: -stageState.x / stageState.scale + this.option.size / stageState.scale,
        y: -stageState.y / stageState.scale,
        width: stageState.width / stageState.scale - this.option.size / stageState.scale,
        height: this.option.size / stageState.scale
      })
      const groupLeft = new Konva.Group({
        x: -stageState.x / stageState.scale,
        y: -stageState.y / stageState.scale + this.option.size / stageState.scale,
        width: this.option.size / stageState.scale,
        height: stageState.height / stageState.scale - this.option.size / stageState.scale
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
          const long = (this.option.size / stageState.scale / 5) * 4
          const short = (this.option.size / stageState.scale / 5) * 3

          if (nx >= 0) {
            groupTop.add(
              new Konva.Line({
                name: this.constructor.name,
                points: _.flatten([
                  [nx, x % 5 ? long : short],
                  [nx, this.option.size / stageState.scale]
                ]),
                stroke: '#999',
                strokeWidth: 1 / stageState.scale,
                listening: false
              })
            )

            if (x % 5 === 0) {
              let fontSize = fontSizeMax

              const text = new Konva.Text({
                name: this.constructor.name,
                y: this.option.size / stageState.scale / 2 - fontSize / stageState.scale,
                text: (x * cellSize).toString(),
                fontSize: fontSize / stageState.scale,
                fill: '#999',
                align: 'center',
                verticalAlign: 'bottom',
                lineHeight: 1.6
              })

              while (text.width() / stageState.scale > (cellSize / stageState.scale) * 4.6) {
                fontSize -= 1
                text.fontSize(fontSize / stageState.scale)
                text.y(this.option.size / stageState.scale / 2 - fontSize / stageState.scale)
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
          const long = (this.option.size / stageState.scale / 5) * 4
          const short = (this.option.size / stageState.scale / 5) * 3

          if (ny >= 0) {
            groupLeft.add(
              new Konva.Line({
                name: this.constructor.name,
                points: _.flatten([
                  [y % 5 ? long : short, ny],
                  [this.option.size / stageState.scale, ny]
                ]),
                stroke: '#999',
                strokeWidth: 1 / stageState.scale,
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
                fontSize: fontSize / stageState.scale,
                fill: '#999',
                align: 'right',
                verticalAlign: 'bottom',
                lineHeight: 1.6,
                wrap: 'none'
              })

              while (text.width() > short * 0.8) {
                fontSize -= 1
                text.fontSize(fontSize / stageState.scale)
              }
              text.y(ny - text.height() / 2)
              text.width(short - 1 / stageState.scale)
              groupLeft.add(text)
            }
          }
        }
      }

      group.add(
        // 角
        new Konva.Rect({
          name: this.constructor.name,
          x: -stageState.x / stageState.scale,
          y: -stageState.y / stageState.scale,
          width: this.option.size / stageState.scale,
          height: this.option.size / stageState.scale,
          fill: '#ddd'
        })
      )
      group.add(
        // 倍率
        new Konva.Text({
          name: this.constructor.name,
          x: -stageState.x / stageState.scale,
          y: -stageState.y / stageState.scale,
          text: `x${stageState.scale.toFixed(1)}`,
          fontSize: 14 / stageState.scale,
          fill: 'blue',
          align: 'center',
          verticalAlign: 'middle',
          width: this.option.size / stageState.scale,
          height: this.option.size / stageState.scale
        })
      )

      group.add(groupTop)
      group.add(groupLeft)

      this.group.add(group)
    }
  }
}

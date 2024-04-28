import _ from 'lodash-es'
import Konva from 'konva'
//
import * as Types from '../types'

export interface PreviewDrawOption {
  size: number
}

export class PreviewDraw extends Types.BaseDraw implements Types.Draw {
  static override readonly name = 'preview'
  option: PreviewDrawOption

  state: { [index: string]: any } = { moving: false }

  constructor(render: Types.Render, layer: Konva.Layer, option: PreviewDrawOption) {
    super(render, layer)

    this.option = option
  }

  override draw() {
    if (this.render.config.showPreview) {
      this.clear()

      // stage 状态
      const stageState = this.render.getStageState()

      const previewMargin = 20

      const group = new Konva.Group({
        name: 'preview',
        scale: { x: this.option.size / stageState.scale, y: this.option.size / stageState.scale },
        width: stageState.width,
        height: stageState.height
      })

      const main = this.render.stage.find('#main')[0] as Konva.Layer

      // 提取节点
      const nodes = main.getChildren((node) => {
        return !this.render.ignore(node)
      })

      // 计算节点占用的区域
      let minX = 0
      let maxX = group.width()
      let minY = 0
      let maxY = group.height()
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

      group.setAttrs({
        x:
          (-stageState.x + stageState.width - maxX * this.option.size - previewMargin) /
          stageState.scale,
        y:
          (-stageState.y + stageState.height - maxY * this.option.size - previewMargin) /
          stageState.scale,
        width: maxX - minX,
        height: maxY - minY
      })

      const bg = new Konva.Rect({
        name: this.constructor.name,
        x: minX,
        y: minY,
        width: group.width(),
        height: group.height(),
        stroke: '#666',
        strokeWidth: 1 / stageState.scale,
        fill: '#eee'
      })

      const move = () => {
        this.state.moving = true

        const pos = this.render.stage.getPointerPosition()
        if (pos) {
          const pWidth = group.width() * this.option.size
          const pHeight = group.height() * this.option.size
          const pOffsetX =
            group.width() * this.option.size - (stageState.width - pos.x - previewMargin)
          const pOfsetY =
            group.height() * this.option.size - (stageState.height - pos.y - previewMargin)
          const offsetX = (group.width() * pOffsetX) / pWidth
          const offsetY = (group.height() * pOfsetY) / pHeight

          // 点击预览框，点击位置作为画布中心
          this.render.positionTool.updateCenter(offsetX, offsetY)
        }
      }

      bg.on('mousedown', (e) => {
        if (e.evt.button === Types.MouseButton.左键) {
          move()
        }
        e.evt.preventDefault()
      })
      bg.on('mousemove', (e) => {
        if (this.state.moving) {
          move()
        }
        e.evt.preventDefault()
      })
      bg.on('mouseup', () => {
        this.state.moving = false
      })

      group.add(bg)

      group.add(
        new Konva.Rect({
          name: this.constructor.name,
          x: 0,
          y: 0,
          width: stageState.width,
          height: stageState.height,
          stroke: 'rgba(255,0,0,0.2)',
          strokeWidth: 1 / this.option.size,
          listening: false
        })
      )

      if (stageState.scale > 1) {
        let x1 = (-stageState.x + this.render.rulerSize) / stageState.scale
        x1 = x1 > minX ? x1 : minX
        x1 = x1 < maxX ? x1 : maxX
        let y1 = (-stageState.y + this.render.rulerSize) / stageState.scale
        y1 = y1 > minY ? y1 : minY
        y1 = y1 < maxY ? y1 : maxY
        let x2 =
          (-stageState.x + this.render.rulerSize) / stageState.scale +
          stageState.width / stageState.scale
        x2 = x2 > minX ? x2 : minX
        x2 = x2 < maxX ? x2 : maxX
        let y2 =
          (-stageState.y + this.render.rulerSize) / stageState.scale +
          stageState.height / stageState.scale
        y2 = y2 > minY ? y2 : minY
        y2 = y2 < maxY ? y2 : maxY

        let points: Array<[x: number, y: number]> = []
        if (
          x1 > minX &&
          x1 < maxX &&
          x2 > minX &&
          x2 < maxX &&
          y1 > minY &&
          y1 < maxY &&
          y2 > minY &&
          y2 < maxY
        ) {
          points = [
            [x1, y1],
            [x2, y1],
            [x2, y2],
            [x1, y2],
            [x1, y1]
          ]
        }
        if (
          x1 > minX &&
          x1 < maxX &&
          x2 > minX &&
          x2 < maxX &&
          y1 === minY &&
          y1 < maxY &&
          y2 > minY &&
          y2 < maxY
        ) {
          points = [
            [x2, y1],
            [x2, y2],
            [x1, y2],
            [x1, y1]
          ]
        }
        if (
          x1 > minX &&
          x1 < maxX &&
          x2 > minX &&
          x2 === maxX &&
          y1 === minY &&
          y1 < maxY &&
          y2 > minY &&
          y2 < maxY
        ) {
          points = [
            [x2, y2],
            [x1, y2],
            [x1, y1]
          ]
        }
        if (
          x1 > minX &&
          x1 < maxX &&
          x2 > minX &&
          x2 === maxX &&
          y1 > minY &&
          y1 < maxY &&
          y2 > minY &&
          y2 < maxY
        ) {
          points = [
            [x2, y1],
            [x1, y1],
            [x1, y2],
            [x2, y2]
          ]
        }
        if (
          x1 > minX &&
          x1 < maxX &&
          x2 > minX &&
          x2 === maxX &&
          y1 > minY &&
          y1 < maxY &&
          y2 > minY &&
          y2 === maxY
        ) {
          points = [
            [x2, y1],
            [x1, y1],
            [x1, y2]
          ]
        }
        if (
          x1 > minX &&
          x1 < maxX &&
          x2 > minX &&
          x2 < maxX &&
          y1 > minY &&
          y1 < maxY &&
          y2 > minY &&
          y2 === maxY
        ) {
          points = [
            [x1, y2],
            [x1, y1],
            [x2, y1],
            [x2, y2]
          ]
        }
        if (
          x1 === minX &&
          x1 < maxX &&
          x2 > minX &&
          x2 < maxX &&
          y1 > minY &&
          y1 < maxY &&
          y2 > minY &&
          y2 === maxY
        ) {
          points = [
            [x1, y1],
            [x2, y1],
            [x2, y2]
          ]
        }
        if (
          x1 === minX &&
          x1 < maxX &&
          x2 > minX &&
          x2 < maxX &&
          y1 > minY &&
          y1 < maxY &&
          y2 > minY &&
          y2 < maxY
        ) {
          points = [
            [x1, y1],
            [x2, y1],
            [x2, y2],
            [x1, y2]
          ]
        }
        if (
          x1 === minX &&
          x1 < maxX &&
          x2 > minX &&
          x2 < maxX &&
          y1 === minY &&
          y1 < maxY &&
          y2 > minY &&
          y2 < maxY
        ) {
          points = [
            [x2, y1],
            [x2, y2],
            [x1, y2]
          ]
        }
        //
        // for (const p of points) {
        //   p[0] = p[0] + 100;
        // }
        //
        group.add(
          new Konva.Line({
            name: this.constructor.name,
            points: _.flatten(points),
            stroke: 'blue',
            strokeWidth: 1 / this.option.size,
            listening: false
          })
        )
      }

      for (const node of nodes) {
        const copy = node.clone()
        copy.listening(false)
        copy.name(this.constructor.name)
        if (copy.attrs.nodeMousedownPos) {
          copy.visible(true)
        }
        group.add(copy)
      }

      this.group.add(group)
    }
  }
}

import _ from 'lodash-es'
import Konva from 'konva'
//
import * as Types from '../types'
import * as Draws from '../draws'

export interface PreviewDrawOption {
  size: number
}

export class PreviewDraw extends Types.BaseDraw implements Types.Draw {
  static override readonly name = 'preview'
  option: PreviewDrawOption

  state: { [index: string]: any } = {
    moving: false // 正在预览框内部拖动
  }

  constructor(render: Types.Render, layer: Konva.Layer, option: PreviewDrawOption) {
    super(render, layer)

    this.option = option
  }

  override draw() {
    if (this.render.config.showPreview) {
      this.clear()

      // stage 状态
      const stageState = this.render.getStageState()

      // 预览框的外边距
      const previewMargin = 20

      // 预览框 group
      const group = new Konva.Group({
        name: 'preview',
        scale: {
          x: this.render.toStageValue(this.option.size),
          y: this.render.toStageValue(this.option.size)
        },
        width: stageState.width,
        height: stageState.height
      })

      const main = this.render.stage.find('#main')[0] as Konva.Layer
      const cover = this.render.stage.find('#cover')[0] as Konva.Layer

      // 提取节点
      const nodes = [
        ...main.getChildren((node) => {
          return !this.render.ignore(node)
        }),
        // 补充连线
        ...cover.getChildren((node) => {
          return node.name() === Draws.LinkDraw.name
        })
      ]
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

      // 根据占用的区域调整预览框的大小
      group.setAttrs({
        x: this.render.toStageValue(
          -stageState.x +
            this.render.rulerSize +
            stageState.width -
            maxX * this.option.size -
            previewMargin
        ),
        y: this.render.toStageValue(
          -stageState.y +
            this.render.rulerSize +
            stageState.height -
            maxY * this.option.size -
            previewMargin
        ),
        width: maxX - minX,
        height: maxY - minY
      })

      // 预览框背景
      const bg = new Konva.Rect({
        name: this.constructor.name,
        x: minX,
        y: minY,
        width: group.width(),
        height: group.height(),
        stroke: '#666',
        strokeWidth: this.render.toStageValue(1),
        fill: '#eee'
      })

      // 根据预览框内部拖动，同步画布的移动
      const move = () => {
        this.state.moving = true

        const pos = this.render.stage.getPointerPosition()
        if (pos) {
          const pWidth = group.width() * this.option.size
          const pHeight = group.height() * this.option.size

          const pOffsetX = pWidth - (stageState.width - pos.x - previewMargin)
          const pOffsetY = pHeight - (stageState.height - pos.y - previewMargin)

          const offsetX = pOffsetX / this.option.size
          const offsetY = pOffsetY / this.option.size

          // 点击预览框，点击位置作为画布中心
          this.render.positionTool.updateCenter(
            offsetX - this.render.rulerSize / this.option.size,
            offsetY - this.render.rulerSize / this.option.size
          )
        }
      }

      // 预览框内拖动事件处理
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

      // 预览框 边框
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

      // 复制提取的节点，用作预览
      for (const node of nodes) {
        const copy = node.clone()
        // 不可交互
        copy.listening(false)
        // 设置名称用于 ignore
        copy.name(this.constructor.name)
        group.add(copy)
      }

      // 放大的时候，显示当前可视区域提示框
      if (stageState.scale > 1) {
        // 画布可视区域起点坐标（左上）
        let x1 = this.render.toStageValue(-stageState.x + this.render.rulerSize)
        let y1 = this.render.toStageValue(-stageState.y + this.render.rulerSize)
        // 限制可视区域提示框不能超出预览区域
        x1 = x1 > minX ? x1 : minX
        x1 = x1 < maxX ? x1 : maxX
        y1 = y1 > minY ? y1 : minY
        y1 = y1 < maxY ? y1 : maxY

        // 画布可视区域起点坐标（右下）
        let x2 =
          this.render.toStageValue(-stageState.x + this.render.rulerSize) +
          this.render.toStageValue(stageState.width)
        let y2 =
          this.render.toStageValue(-stageState.y + this.render.rulerSize) +
          this.render.toStageValue(stageState.height)
        // 限制可视区域提示框不能超出预览区域
        x2 = x2 > minX ? x2 : minX
        x2 = x2 < maxX ? x2 : maxX
        y2 = y2 > minY ? y2 : minY
        y2 = y2 < maxY ? y2 : maxY

        // 可视区域提示框 连线坐标序列
        let points: Array<[x: number, y: number]> = []

        // 可视区域提示框“超出”预览区域影响的“边”不做绘制
        // "超出"（上面实际处理：把超过的坐标设置为上/下线，判断方式如[以正则表达式表示]：(x|y)(1|2) === (min|max)(X|Y)）
        //
        // 简单直接穷举 9 种情况：
        // 不超出
        // 上超出 下超出
        // 左超出 右超出
        // 左上超出 右上超出
        // 左下超出 右下超出

        // 不超出，绘制完整矩形
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
        // 上超出，不绘制“上边”
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
        // 下超出，不绘制“下边”
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
        // 左超出，不绘制“左边”
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
        // 右超出，不绘制“右边”
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
        // 左上超出，不绘制“上边”、“左边”
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
        // 右上超出，不绘制“上边”、“右边”
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
        // 左下超出，不绘制“下边”、“左边”
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
        // 右下超出，不绘制“下边”、“右边”
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

        // 可视区域提示框
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

      this.group.add(group)
    }
  }
}

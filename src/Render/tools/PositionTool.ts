import Konva from 'konva'
//
import { Render } from '../index'
//
import * as Draws from '../draws'

export class PositionTool {
  static readonly name = 'PositionTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  // 自适应大小
  positionFit() {
    const children = [
      ...this.render.layer.getChildren(),
      ...this.render.layerCover.find('.link-line')
    ]

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity,
      minStartX = Infinity,
      minStartY = Infinity

    const stageState = this.render.getStageState()
    for (const node of children) {
      if (node instanceof Konva.Group) {
        const { x, y, width, height } = ((rect) => ({
          x: this.render.toStageValue(rect.x - stageState.x),
          y: this.render.toStageValue(rect.y - stageState.y),
          width: this.render.toStageValue(rect.width),
          height: this.render.toStageValue(rect.height)
        }))(node.getClientRect())

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

        if (x < minStartX) {
          minStartX = x
        }
        if (y < minStartY) {
          minStartY = y
        }
      } else if (node instanceof Konva.Line && node.name() === 'link-line') {
        // 连线占用空间
        const points = node.points()
        for (let i = 0; i < points.length; i += 2) {
          const [x, y] = [points[i], points[i + 1]]

          if (x < minX) {
            minX = x - 1
          }
          if (x > maxX) {
            maxX = x + 1
          }
          if (y < minY) {
            minY = y - 1
          }
          if (y > maxY) {
            maxY = y + 1
          }
          if (x < minStartX) {
            minStartX = x - 1
          }
          if (y < minStartY) {
            minStartY = y - 1
          }
        }
      }
    }

    minX === Infinity && (minX = (this.render.stage.width() - this.render.rulerSize) / 2)
    maxX === -Infinity && (maxX = minX)
    minY === Infinity && (minY = (this.render.stage.height() - this.render.rulerSize) / 2)
    maxY === -Infinity && (maxY = minY)
    minStartX === Infinity && minX
    minStartY === Infinity && minY

    const assetSize = {
      width: maxX - minX,
      height: maxY - minY
    }
    const assetRate = assetSize.width / assetSize.height

    const viewSize = {
      width: this.render.stage.width() - (this.render.config.readonly ? 0 : this.render.rulerSize),
      height: this.render.stage.height() - (this.render.config.readonly ? 0 : this.render.rulerSize)
    }
    const viewRate = viewSize.width / viewSize.height

    if (assetSize.width > viewSize.width || assetSize.height > viewSize.height) {
      let scale = 1

      if (viewRate > assetRate) {
        scale = viewSize.height / assetSize.height
      } else if (viewRate < assetRate) {
        scale = viewSize.width / assetSize.width
      }

      scale = Math.max(0.2, scale)

      scale = Math.floor(scale * 100) / 100

      this.render.stage.setAttrs({
        scale: { x: scale, y: scale },
        position: {
          x:
            (this.render.config.readonly ? 0 : this.render.rulerSize) -
            minX * scale +
            (viewSize.width - assetSize.width * scale) / 2,
          y:
            (this.render.config.readonly ? 0 : this.render.rulerSize) -
            minY * scale +
            (viewSize.height - assetSize.height * scale) / 2
        }
      })

      this.render.emit('scale-change', scale)

      // 重绘
      this.render.redraw([
        Draws.BgDraw.name,
        Draws.GraphDraw.name,
        Draws.LinkDraw.name,
        Draws.RulerDraw.name,
        Draws.RefLineDraw.name,
        Draws.PreviewDraw.name
      ])
    } else {
      this.positionZoomReset()
    }
  }

  // 恢复位置大小
  positionZoomReset() {
    this.render.stage.setAttrs({
      scale: { x: 1, y: 1 }
    })

    this.render.emit('scale-change', 1)

    this.positionReset()
  }

  // 恢复位置
  positionReset() {
    this.render.stage.setAttrs({
      x: this.render.rulerSize,
      y: this.render.rulerSize
    })

    // 重绘
    this.render.redraw([
      Draws.BgDraw.name,
      Draws.GraphDraw.name,
      Draws.LinkDraw.name,
      Draws.RulerDraw.name,
      Draws.RefLineDraw.name,
      Draws.PreviewDraw.name
    ])
  }

  // 更新中心位置
  updateCenter(x = 0, y = 0) {
    // stage 状态
    const stageState = this.render.getStageState()

    // 提取节点
    const nodes = this.render.layer.getChildren((node) => {
      return !this.render.ignore(node)
    })

    // 计算节点占用的区域（计算起点即可）
    let minX = 0
    let minY = 0
    for (const node of nodes) {
      const x = node.x()
      const y = node.y()

      if (x < minX) {
        minX = x
      }
      if (y < minY) {
        minY = y
      }
    }

    // 居中画布
    this.render.stage.setAttrs({
      x:
        stageState.width / 2 -
        this.render.toBoardValue(minX) -
        this.render.toBoardValue(x) +
        this.render.rulerSize,
      y:
        stageState.height / 2 -
        this.render.toBoardValue(minY) -
        this.render.toBoardValue(y) +
        this.render.rulerSize
    })

    // 重绘
    this.render.redraw([
      Draws.BgDraw.name,
      Draws.GraphDraw.name,
      Draws.LinkDraw.name,
      Draws.RulerDraw.name,
      Draws.RefLineDraw.name,
      Draws.PreviewDraw.name
    ])
  }
}

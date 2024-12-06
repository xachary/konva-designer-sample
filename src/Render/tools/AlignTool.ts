import { Render } from '../index'
//
import * as Types from '../types'
import Konva from 'konva'
import * as Draws from '../draws'

export class AlignTool {
  static readonly name = 'AlignTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  getAlignRect(node: Konva.Node | Konva.Transformer) {
    // stage 状态
    const stageState = this.render.getStageState()

    let width = 0,
      height = 0,
      x = 0,
      y = 0

    const result = node.getClientRect()

    // 转为 逻辑觉尺寸
    ;[width, height, x, y] = [
      this.render.toStageValue(result.width),
      this.render.toStageValue(result.height),
      this.render.toStageValue(result.x - stageState.x),
      this.render.toStageValue(result.y - stageState.y)
    ]

    return { width, height, x, y }
  }

  // 对齐参考点
  getAlignPoints(node?: Konva.Node | Konva.Transformer): { [index: string]: number } {
    let width = 0,
      height = 0,
      x = 0,
      y = 0

    if (node !== void 0) {
      // 选择器 / 基于节点

      // 逻辑觉尺寸
      const rect = this.getAlignRect(node)
      ;[width, height, x, y] = [rect.width, rect.height, rect.x, rect.y]
    } else {
      // 默认为选择器
      return this.getAlignPoints(this.render.transformer)
    }

    return {
      [Types.AlignType.垂直居中]: x + width / 2,
      [Types.AlignType.左对齐]: x,
      [Types.AlignType.右对齐]: x + width,
      [Types.AlignType.水平居中]: y + height / 2,
      [Types.AlignType.上对齐]: y,
      [Types.AlignType.下对齐]: y + height
    }
  }

  align(type: Types.AlignType, target?: Konva.Node) {
    // 对齐参考点（所有）
    const points = this.getAlignPoints(target)

    // 对齐参考点
    const point = points[type]

    // 需要移动的节点
    const nodes = this.render.transformer.nodes().filter((node) => node !== target)

    // 移动逻辑
    for (const node of nodes) {
      // 逻辑觉尺寸
      const rect = this.getAlignRect(node)
      const [width, height, x, y] = [rect.width, rect.height, rect.x, rect.y]

      switch (type) {
        case Types.AlignType.垂直居中:
          {
            const cx = x + width / 2
            node.x(node.x() + (point - cx))
          }
          break
        case Types.AlignType.水平居中:
          {
            const cy = y + height / 2
            node.y(node.y() + (point - cy))
          }
          break
        case Types.AlignType.左对齐:
          {
            const cx = x
            node.x(node.x() + (point - cx))
          }
          break
        case Types.AlignType.右对齐:
          {
            const cx = x + width
            node.x(node.x() + (point - cx))
          }
          break
        case Types.AlignType.上对齐:
          {
            const cy = y
            node.y(node.y() + (point - cy))
          }
          break
        case Types.AlignType.下对齐:
          {
            const cy = y + height
            node.y(node.y() + (point - cy))
          }
          break
      }
    }

    // 更新历史
    this.render.updateHistory()

    // 重绘
    this.render.redraw([
      Draws.GraphDraw.name,
      Draws.LinkDraw.name,
      Draws.RulerDraw.name,
      Draws.PreviewDraw.name
    ])
  }
}

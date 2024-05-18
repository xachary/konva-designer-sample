import { Render } from '../index'
//
import * as Types from '../types'
import * as Draws from '../draws'
import Konva from 'konva'

export class AlignTool {
  static readonly name = 'AlignTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  // 对齐参考点
  getAlignPoints(target?: Konva.Node | Konva.Transformer): { [index: string]: number } {
    let width = 0,
      height = 0,
      x = 0,
      y = 0

    if (target instanceof Konva.Transformer) {
      // 选择器
      // 转为 逻辑觉尺寸
      ;[width, height] = [
        this.render.toStageValue(target.width()),
        this.render.toStageValue(target.height())
      ]
      ;[x, y] = [
        this.render.toStageValue(target.x()) - this.render.rulerSize,
        this.render.toStageValue(target.y()) - this.render.rulerSize
      ]
    } else if (target !== void 0) {
      // 节点
      // 逻辑尺寸
      ;[width, height] = [target.width(), target.height()]
      ;[x, y] = [target.x(), target.y()]
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
    switch (type) {
      case Types.AlignType.垂直居中:
        for (const node of nodes) {
          node.x(point - node.width() / 2)
        }
        break
      case Types.AlignType.水平居中:
        for (const node of nodes) {
          node.y(point - node.height() / 2)
        }
        break
      case Types.AlignType.左对齐:
        for (const node of nodes) {
          node.x(point)
        }
        break
      case Types.AlignType.右对齐:
        for (const node of nodes) {
          node.x(point - node.width())
        }
        break
      case Types.AlignType.上对齐:
        for (const node of nodes) {
          node.y(point)
        }
        break
      case Types.AlignType.下对齐:
        for (const node of nodes) {
          node.y(point - node.height())
        }
        break
    }
    // 更新历史
    this.render.updateHistory()
    // 更新预览
    this.render.draws[Draws.PreviewDraw.name].draw()
  }
}
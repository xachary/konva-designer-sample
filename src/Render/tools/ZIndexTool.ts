import Konva from 'konva'
import { Render } from '../index'
//
import * as Draws from '../draws'

export class ZIndexTool {
  static readonly name = 'ZIndexTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  // 获取移动节点
  getNodes(nodes: Konva.Node[]) {
    const targets: Konva.Node[] = []
    for (const node of nodes) {
      if (node instanceof Konva.Transformer) {
        // 已选择的节点
        targets.push(...this.render.selectionTool.selectingNodes)
      } else {
        // 未选择的节点
        targets.push(node)
      }
    }
    return targets
  }

  // 最大 zIndex
  getMaxZIndex() {
    return Math.max(
      ...this.render.layer
        .getChildren((node) => {
          return !this.render.ignore(node)
        })
        .map((o) => o.zIndex())
    )
  }

  // 最小 zIndex
  getMinZIndex() {
    return Math.min(
      ...this.render.layer
        .getChildren((node) => {
          return !this.render.ignore(node)
        })
        .map((o) => o.zIndex())
    )
  }

  // 记录选择期间的 zIndex
  updateSelectingZIndex(nodes: Konva.Node[]) {
    for (const node of nodes) {
      node.setAttrs({
        selectingZIndex: node.zIndex()
      })
    }
  }

  // 恢复选择期间的 zIndex
  resetSelectingZIndex(nodes: Konva.Node[]) {
    nodes.sort((a, b) => a.zIndex() - b.zIndex())
    for (const node of nodes) {
      node.zIndex(node.attrs.selectingZIndex)
    }
  }

  // 更新 zIndex 缓存
  updateLastZindex(nodes: Konva.Node[]) {
    for (const node of nodes) {
      node.setAttrs({
        lastZIndex: node.zIndex()
      })
    }
  }

  // 上移
  up(nodes: Konva.Node[]) {
    // 最大zIndex
    const maxZIndex = this.getMaxZIndex()

    const sorted = this.getNodes(nodes).sort((a, b) => b.zIndex() - a.zIndex())

    // 上移
    let lastNode: Konva.Node | null = null

    if (this.render.selectionTool.selectingNodes.length > 0) {
      this.updateSelectingZIndex(sorted)

      for (const node of sorted) {
        if (
          node.attrs.lastZIndex < maxZIndex &&
          (lastNode === null || node.attrs.lastZIndex < lastNode.attrs.lastZIndex - 1)
        ) {
          node.setAttrs({
            lastZIndex: node.attrs.lastZIndex + 1
          })
        }
        lastNode = node
      }

      this.resetSelectingZIndex(sorted)
    } else {
      // 直接调整
      for (const node of sorted) {
        if (
          node.zIndex() < maxZIndex &&
          (lastNode === null || node.zIndex() < lastNode.zIndex() - 1)
        ) {
          node.zIndex(node.zIndex() + 1)
        }
        lastNode = node
      }

      this.updateLastZindex(sorted)

      // 更新历史
      this.render.updateHistory()
      // 更新连线
      this.render.draws[Draws.LinkDraw.name].draw()
      // 更新预览
      this.render.draws[Draws.PreviewDraw.name].draw()
    }
  }

  // 下移
  down(nodes: Konva.Node[]) {
    // 最小 zIndex
    const minZIndex = this.getMinZIndex()

    const sorted = this.getNodes(nodes).sort((a, b) => a.zIndex() - b.zIndex())

    // 下移
    let lastNode: Konva.Node | null = null

    if (this.render.selectionTool.selectingNodes.length > 0) {
      this.updateSelectingZIndex(sorted)

      for (const node of sorted) {
        if (
          node.attrs.lastZIndex > minZIndex &&
          (lastNode === null || node.attrs.lastZIndex > lastNode.attrs.lastZIndex + 1)
        ) {
          node.setAttrs({
            lastZIndex: node.attrs.lastZIndex - 1
          })
        }
        lastNode = node
      }

      this.resetSelectingZIndex(sorted)
    } else {
      // 直接调整
      for (const node of sorted) {
        if (
          node.zIndex() > minZIndex &&
          (lastNode === null || node.zIndex() > lastNode.zIndex() + 1)
        ) {
          node.zIndex(node.zIndex() - 1)
        }
        lastNode = node
      }

      this.updateLastZindex(sorted)

      // 更新历史
      this.render.updateHistory()
      // 更新连线
      this.render.draws[Draws.LinkDraw.name].draw()
      // 更新预览
      this.render.draws[Draws.PreviewDraw.name].draw()
    }
  }

  // 置顶
  top(nodes: Konva.Node[]) {
    // 最大 zIndex
    let maxZIndex = this.getMaxZIndex()

    const sorted = this.getNodes(nodes).sort((a, b) => b.zIndex() - a.zIndex())

    if (this.render.selectionTool.selectingNodes.length > 0) {
      // 先选中再调整
      this.updateSelectingZIndex(sorted)

      // 置顶
      for (const node of sorted) {
        node.setAttrs({
          lastZIndex: maxZIndex--
        })
      }

      this.resetSelectingZIndex(sorted)
    } else {
      // 直接调整

      for (const node of sorted) {
        node.zIndex(maxZIndex)
      }

      this.updateLastZindex(sorted)

      // 更新历史
      this.render.updateHistory()
      // 更新连线
      this.render.draws[Draws.LinkDraw.name].draw()
      // 更新预览
      this.render.draws[Draws.PreviewDraw.name].draw()
    }
  }

  // 置底
  bottom(nodes: Konva.Node[]) {
    // 最小 zIndex
    let minZIndex = this.getMinZIndex()

    const sorted = this.getNodes(nodes).sort((a, b) => a.zIndex() - b.zIndex())

    if (this.render.selectionTool.selectingNodes.length > 0) {
      // 先选中再调整
      this.updateSelectingZIndex(sorted)

      // 置底
      for (const node of sorted) {
        node.setAttrs({
          lastZIndex: minZIndex++
        })
      }

      this.resetSelectingZIndex(sorted)
    } else {
      // 直接调整

      for (const node of sorted) {
        node.zIndex(minZIndex)
      }

      this.updateLastZindex(sorted)

      // 更新历史
      this.render.updateHistory()
      // 更新连线
      this.render.draws[Draws.LinkDraw.name].draw()
      // 更新预览
      this.render.draws[Draws.PreviewDraw.name].draw()
    }
  }
}

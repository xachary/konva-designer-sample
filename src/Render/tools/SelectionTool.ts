import Konva from 'konva'
//
import { Render } from '../index'

export class SelectionTool {
  static readonly name = 'SelectionTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  // 【被选中的】
  selectingNodes: Konva.Node[] = []

  // 清空已选
  selectingClear() {
    // 清空选择
    this.render.transformer.nodes([])

    const change =
      this.selectingNodes.findIndex(
        (o) => o.attrs.lastZIndex !== void 0 && o.zIndex() !== o.attrs.lastZIndex
      ) > -1

    // 恢复透明度、层次、可交互
    for (const node of this.selectingNodes.sort(
      (a, b) => a.attrs.lastZIndex - b.attrs.lastZIndex
    )) {
      node.setAttrs({
        listening: true,
        opacity: node.attrs.lastOpacity ?? 1,
        zIndex: node.attrs.lastZIndex
      })
    }
    // 清空状态
    for (const node of this.selectingNodes) {
      node.setAttrs({
        nodeMousedownPos: undefined,
        lastOpacity: undefined,
        lastZIndex: undefined,
        selectingZIndex: undefined
      })
    }

    // 清空选择节点
    this.selectingNodes = []

    if (change) {
      // 更新历史
      this.render.updateHistory()
    }
  }

  // 选择节点
  select(nodes: Konva.Node[]) {
    // 选之前，清一下
    this.selectingClear()

    if (nodes.length > 0) {
      // 最大zIndex
      const maxZIndex = Math.max(
        ...this.render.layer
          .getChildren((node) => {
            return !this.render.ignore(node)
          })
          .map((o) => o.zIndex())
      )

      // 记录状态
      for (const node of nodes) {
        node.setAttrs({
          nodeMousedownPos: node.position(), // 后面用于移动所选
          lastOpacity: node.opacity(), // 选中时，下面会使其变透明，记录原有的透明度
          lastZIndex: node.zIndex() // 记录原有的层次，后面暂时提升所选节点的层次
        })
      }

      // 设置透明度、提升层次、不可交互
      for (const node of nodes.sort((a, b) => a.zIndex() - b.zIndex())) {
        node.setAttrs({
          listening: false,
          opacity: node.opacity() * 0.8,
          zIndex: maxZIndex
        })
      }

      // 选中的节点
      this.selectingNodes = nodes

      // 选中的节点，放进 transformer
      this.render.transformer.nodes(this.selectingNodes)
    }
  }

  // 更新节点位置
  selectingNodesMove(offset: Konva.Vector2d) {
    for (const node of this.render.selectionTool.selectingNodes) {
      node.x(node.x() + offset.x)
      node.y(node.y() + offset.y)
    }
  }
}

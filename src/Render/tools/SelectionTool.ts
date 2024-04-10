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

  // 代替【被选中的】进行整体移动、放大缩小、旋转动作
  selectingNodesArea: Konva.Group | null = null

  // 清空已选
  selectingClear() {
    // 清空选择
    this.render.transformer.nodes([])

    // 移除 selectingNodesArea
    this.selectingNodesArea?.remove()
    this.selectingNodesArea = null

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
  }

  // 选择节点
  select(nodes: Konva.Node[]) {
    // 选之前，清一下
    this.selectingClear()

    if (nodes.length > 0) {
      // 用于撑开 transformer
      this.selectingNodesArea = new Konva.Group({
        visible: false,
        // opacity: 0.2,
        listening: false
      })

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
        const copy = node.clone()

        this.selectingNodesArea.add(copy)

        node.setAttrs({
          listening: false,
          opacity: node.opacity() * 0.8,
          zIndex: maxZIndex
        })
      }

      // 选中的节点
      this.selectingNodes = nodes

      // 放进 transformer 所在的层
      this.render.groupTransformer.add(this.selectingNodesArea)

      // 选中的节点，放进 transformer
      this.render.transformer.nodes([...this.selectingNodes, this.selectingNodesArea])
    }
  }
}

import Konva from 'konva'
//
import { Render } from '../index'
//
import * as Draws from '../draws'
import { nanoid } from 'nanoid'

// import { nanoid } from 'nanoid'

export class CopyTool {
  static readonly name = 'CopyTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  // 复制暂存
  pasteCache: Konva.Node[] = []
  // 粘贴次数（用于定义新节点的偏移距离）
  pasteCount = 1

  // 复制
  pasteStart() {
    this.pasteCache = this.render.selectionTool.selectingNodes.map((o) => {
      const copy = o.clone()
      // 恢复透明度、可交互
      copy.setAttrs({
        listening: true,
        opacity: copy.attrs.lastOpacity ?? 1
      })
      // 清空状态
      copy.setAttrs({
        nodeMousedownPos: undefined,
        lastOpacity: undefined,
        lastZIndex: undefined,
        selectingZIndex: undefined
      })
      return copy
    })
    this.pasteCount = 1
  }

  // 粘贴
  pasteEnd() {
    if (this.pasteCache.length > 0) {
      this.render.selectionTool.selectingClear()
      this.copy(this.pasteCache)
      this.pasteCount++
    }
  }

  /**
   * 复制粘贴
   * @param nodes 节点数组
   * @param skip 跳过检查
   * @returns 复制的元素
   */
  copy(nodes: Konva.Node[]) {
    // const linkDrawState = (this.render.draws[Draws.LinkDraw.name] as Draws.LinkDraw).state

    const clones: Konva.Group[] = []

    for (const node of nodes) {
      if (node instanceof Konva.Transformer) {
        // 复制已选择
        const backup = [...this.render.selectionTool.selectingNodes]
        this.render.selectionTool.selectingClear()
        this.copy(backup)
      } else {
        // 复制未选择（先记录，后处理）
        clones.push(node.clone())
      }
    }

    // 处理克隆节点
    for (const copy of clones) {
      // 原id
      const prototypeId = copy.id()
      // 新id
      copy.id(nanoid())
      copy.find('.point').forEach((p) => {
        p.id(nanoid())
        p.setAttrs({
          groupId: copy.id(),
          prototypeId // 记录原id
        })
      })

      // 给克隆节点恢复 linkDrawState 的 linkPairs、linkPoint
      // TODO: src\Render\handlers\LinkHandlers.ts:94
      // TODO: src\Render\draws\LinkDraw.ts:146

      // 使新节点产生偏移
      copy.setAttrs({
        x: copy.x() + this.render.toStageValue(this.render.bgSize) * this.pasteCount,
        y: copy.y() + this.render.toStageValue(this.render.bgSize) * this.pasteCount
      })
    }

    // 插入新节点
    this.render.layer.add(...clones)
    // 选中复制内容
    this.render.selectionTool.select(clones)

    // 更新历史
    this.render.updateHistory()
    // 更新连线
    this.render.draws[Draws.LinkDraw.name].draw()
    // 更新预览
    this.render.draws[Draws.PreviewDraw.name].draw()
  }
}

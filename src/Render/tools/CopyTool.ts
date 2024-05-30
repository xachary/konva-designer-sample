import Konva from 'konva'
//
import { Render } from '../index'
//
import * as Draws from '../draws'
import { nanoid } from 'nanoid'

import type { LinkDrawPair } from '../draws/LinkDraw'
import { LinkGroupEventBind, LinkPointEventBind } from '../LinkPointHandlers'

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
    const linkDrawState = (this.render.draws[Draws.LinkDraw.name] as Draws.LinkDraw).state

    const clones: Konva.Group[] = []

    for (const node of nodes) {
      if (node instanceof Konva.Transformer) {
        // 复制已选择
        const backup = [...this.render.selectionTool.selectingNodes]
        this.render.selectionTool.selectingClear()
        this.copy(backup)

        return
      } else {
        // 复制未选择（先记录，后处理）
        clones.push(node.clone())
      }
    }

    // 处理克隆节点
    for (const copy of clones) {
      // 节点 原id
      const prototypeId = copy.id()
      copy.setAttrs({
        prototypeId: prototypeId // 记录 节点 原id
      })
      // 节点 新id
      copy.id(nanoid())

      // 重新绑定连接线所需事件
      LinkGroupEventBind(this.render, copy)

      // 连接点 新id
      copy.find('.point').forEach((p) => {
        if (p instanceof Konva.Circle) {
          p.setAttrs({
            groupId: copy.id(), // 节点 新id
            prototypeId: p.id() // 记录 连接点 原id
          })
          // 连接点 新id
          p.id(nanoid())

          // 重新绑定连接线所需事件
          LinkPointEventBind(this.render, copy, p)
        }
      })

      // 使新节点产生偏移
      copy.setAttrs({
        x: copy.x() + this.render.toStageValue(this.render.bgSize) * this.pasteCount,
        y: copy.y() + this.render.toStageValue(this.render.bgSize) * this.pasteCount
      })
    }

    // 恢复 连接线 状态
    const inserts: LinkDrawPair[] = []
    for (const pair of linkDrawState.linkPairs) {
      const fromGroup = clones.find((o) => o.attrs.prototypeId === pair.from.groupId)
      const fromCircle = fromGroup
        ?.find('.point')
        .find((o) => o.attrs.prototypeId === pair.from.circleId)

      const toGroup = clones.find((o) => o.attrs.prototypeId === pair.to.groupId)
      const toCircle = toGroup?.find('.point').find((o) => o.attrs.prototypeId === pair.to.circleId)

      if (fromGroup && fromCircle && toGroup && toCircle && pair.points) {
        inserts.push({
          from: {
            groupId: fromGroup?.id(),
            circleId: fromCircle?.id()
          },
          to: {
            groupId: toGroup?.id(),
            circleId: toCircle?.id()
          },
          points: pair.points.map((o) => ({ ...o, id: nanoid() })),
          selected: false
        })
      }
    }

    linkDrawState.linkPairs.push(...inserts)

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

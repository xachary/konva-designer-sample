import _ from 'lodash-es'
import Konva from 'konva'
//
import { Render } from '../index'
//
import * as Draws from '../draws'
import { nanoid } from 'nanoid'

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
        selectingZIndex: undefined,
        selected: false
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

    // 新旧 id 映射
    const groupIdChanges: { [index: string]: string } = {}
    const pointIdChanges: { [index: string]: string } = {}

    // 新 id、新事件
    for (const copy of clones) {
      const gid = nanoid()
      groupIdChanges[copy.id()] = gid
      copy.id(gid)

      const pointsClone = _.cloneDeep(copy.getAttr('points') ?? [])
      copy.setAttr('points', pointsClone)

      for (const point of pointsClone) {
        const pid = nanoid()
        pointIdChanges[point.id] = pid

        const anchor = copy.findOne(`#${point.id}`)
        anchor?.id(pid)

        point.id = pid

        point.groupId = copy.id()
        point.visible = false
      }

      copy.off('mouseenter')
      copy.on('mouseenter', () => {
        // 显示 连接点
        this.render.linkTool.pointsVisible(true, copy)
      })
      copy.off('mouseleave')
      copy.on('mouseleave', () => {
        // 隐藏 连接点
        this.render.linkTool.pointsVisible(false, copy)

        // 隐藏 hover 框
        copy.findOne('#hoverRect')?.visible(false)
      })

      // 使新节点产生偏移
      copy.setAttrs({
        x: copy.x() + this.render.toStageValue(this.render.bgSize) * this.pasteCount,
        y: copy.y() + this.render.toStageValue(this.render.bgSize) * this.pasteCount
      })
    }

    // pairs 新 id
    for (const copy of clones) {
      const points = copy.getAttr('points') ?? []
      for (const point of points) {
        for (const pair of point.pairs) {
          // id 换新
          pair.id = nanoid()
          pair.from.groupId = groupIdChanges[pair.from.groupId]
          pair.from.pointId = pointIdChanges[pair.from.pointId]
          pair.to.groupId = groupIdChanges[pair.to.groupId]
          pair.to.pointId = pointIdChanges[pair.to.pointId]
        }
      }
    }

    // 插入新节点
    this.render.layer.add(...clones)
    // 选中复制内容
    this.render.selectionTool.select(clones)

    // 更新历史
    this.render.updateHistory()
    
    // 重绘
    this.render.redraw()
  }
}

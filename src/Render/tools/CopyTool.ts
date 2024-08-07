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

  // 刷新 id、事件
  nodesIdCover(nodes: Konva.Node[]) {
    let deepAssets = [...nodes]
    const idMap = new Map()

    while (deepAssets.length > 0) {
      const asset = deepAssets.shift()
      if (asset) {
        if (Array.isArray(asset.attrs.points)) {
          for (const point of asset.attrs.points) {
            if (Array.isArray(point.pairs)) {
              for (const pair of point.pairs) {
                if (pair.from.groupId && !idMap.has(pair.from.groupId)) {
                  idMap.set(pair.from.groupId, 'g:' + nanoid())
                }

                if (pair.to.groupId && !idMap.has(pair.to.groupId)) {
                  idMap.set(pair.to.groupId, 'g:' + nanoid())
                }

                if (pair.from.pointId && !idMap.has(pair.from.pointId)) {
                  idMap.set(pair.from.pointId, 'p:' + nanoid())
                }

                if (pair.to.pointId && !idMap.has(pair.to.pointId)) {
                  idMap.set(pair.to.pointId, 'p:' + nanoid())
                }
              }
            }

            if (point.id) {
              if (!idMap.has(point.id)) {
                idMap.set(point.id, 'p:' + nanoid())
              }
            }

            if (point.groupId) {
              if (!idMap.has(point.groupId)) {
                idMap.set(point.groupId, 'g:' + nanoid())
              }
            }
          }
        }

        if (asset.id()) {
          if (!idMap.has(asset.id())) {
            idMap.set(asset.id(), 'n:' + nanoid())
          }
        }

        if (asset instanceof Konva.Group && Array.isArray(asset.children)) {
          deepAssets.push(...asset.children)
        }
      }
    }

    deepAssets = [...nodes]

    while (deepAssets.length > 0) {
      const asset = deepAssets.shift()
      if (asset) {
        if (idMap.has(asset.id())) {
          asset.id(idMap.get(asset.id()))
        }

        if (Array.isArray(asset.attrs.points)) {
          asset.attrs.points = _.cloneDeep(asset.attrs.points ?? [])

          for (const point of asset.attrs.points) {
            if (Array.isArray(point.pairs)) {
              for (const pair of point.pairs) {
                if (pair.id) {
                  pair.id = 'pr:' + nanoid()
                }

                if (idMap.has(pair.from.groupId)) {
                  pair.from.groupId = idMap.get(pair.from.groupId)
                }
                if (idMap.has(pair.to.groupId)) {
                  pair.to.groupId = idMap.get(pair.to.groupId)
                }
                if (idMap.has(pair.from.pointId)) {
                  pair.from.pointId = idMap.get(pair.from.pointId)
                }
                if (idMap.has(pair.to.pointId)) {
                  pair.to.pointId = idMap.get(pair.to.pointId)
                }
              }
            }

            if (idMap.has(point.id)) {
              if (asset instanceof Konva.Group) {
                const anchor = asset.findOne(`#${point.id}`)
                anchor?.id(idMap.get(point.id))
              }

              point.id = idMap.get(point.id)
              point.visible = false
            }

            if (idMap.has(point.groupId)) {
              point.groupId = idMap.get(point.groupId)
            }
          }
        }

        if (asset instanceof Konva.Group && Array.isArray(asset.children)) {
          deepAssets.push(...asset.children)
        }
      }
    }

    for (const node of nodes) {
      if (node instanceof Konva.Group) {
        node.off('mouseenter')
        node.on('mouseenter', () => {
          // 显示 连接点
          this.render.linkTool.pointsVisible(true, node)
        })
        node.off('mouseleave')
        node.on('mouseleave', () => {
          // 隐藏 连接点
          this.render.linkTool.pointsVisible(false, node)

          // 隐藏 hover 框
          node.findOne('#hoverRect')?.visible(false)
        })

        // 使新节点产生偏移
        node.setAttrs({
          x: node.x() + this.render.toStageValue(this.render.bgSize) * this.pasteCount,
          y: node.y() + this.render.toStageValue(this.render.bgSize) * this.pasteCount
        })
      }
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

    // 刷新 id、事件
    this.nodesIdCover(clones)

    // 插入新节点
    this.render.layer.add(...clones)
    // 选中复制内容
    this.render.selectionTool.select(clones)

    // 更新历史
    this.render.updateHistory()

    // 重绘
    this.render.redraw([Draws.LinkDraw.name, Draws.PreviewDraw.name])
  }
}

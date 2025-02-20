import { nanoid } from 'nanoid'
import Konva from 'konva'
//
import { Render } from '../index'

import * as Types from '../types'
import * as Draws from '../draws'

export class LinkTool {
  static readonly name = 'LinkTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  pointsVisible(visible: boolean, group?: Konva.Group) {
    if (!this.render.config.readonly) {
      const start = group ?? this.render.layer

      // 查找深层 points
      for (const asset of [
        ...(['asset', 'sub-asset'].includes(start.name()) ? [start] : []),
        ...start.find('.asset'),
        ...start.find('.sub-asset')
      ]) {
        const points = asset.getAttr('points') ?? []
        asset.setAttrs({
          points: points.map((o: any) => ({ ...o, visible }))
        })
      }

      // 拐点操作中，此处不重绘
      if (!(this.render.draws[Draws.LinkDraw.name] as Draws.LinkDraw)?.state.linkManualing) {
        // 重绘
        this.render.redraw([Draws.LinkDraw.name, Draws.RulerDraw.name, Draws.PreviewDraw.name])
      }
    }
  }

  remove(target?: Konva.Line) {
    const line = target ?? this.linkCurrent
    if (line) {
      const { groupId, pointId, pairId } = line.getAttrs()

      if (groupId && pointId && pairId) {
        const group = this.render.layer.findOne(`#${groupId}`) as Konva.Group
        if (group) {
          const points = (group.getAttr('points') ?? []) as Types.LinkDrawPoint[]
          const point = points.find((o) => o.id === pointId)
          if (point) {
            const pairIndex = (point.pairs ?? ([] as Types.LinkDrawPair[])).findIndex(
              (o) => o.id === pairId
            )
            if (pairIndex > -1) {
              const pair = point.pairs.splice(pairIndex, 1)[0]

              if (group.attrs.manualPointsMap && group.attrs.manualPointsMap[pair.id]) {
                group.setAttr('manualPointsMap', {
                  ...group.attrs.manualPointsMap,
                  [pair.id]: undefined
                })
              }

              // 重绘
              this.render.redraw([
                Draws.LinkDraw.name,
                Draws.RulerDraw.name,
                Draws.PreviewDraw.name
              ])
            }
          }
        }
      }
    }
  }

  // 刷新 json 的 id、事件
  jsonIdCover(assets: any[]) {
    let deepAssets = [...assets]
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

        if (asset.attrs.id) {
          if (!idMap.has(asset.attrs.id)) {
            idMap.set(asset.attrs.id, 'n:' + nanoid())
          }
        }

        if (Array.isArray(asset.children)) {
          deepAssets.push(...asset.children)
        }
      }
    }

    deepAssets = [...assets]

    while (deepAssets.length > 0) {
      const asset = deepAssets.shift()
      if (asset) {
        if (idMap.has(asset.attrs.id)) {
          asset.attrs.id = idMap.get(asset.attrs.id)
        }

        if (Array.isArray(asset.attrs.points)) {
          for (const point of asset.attrs.points) {
            if (Array.isArray(point.pairs)) {
              for (const pair of point.pairs) {
                pair.disabled = true

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
              const anchor = asset.children.find((o: any) => o.attrs.id === point.id)
              point.id = idMap.get(point.id)
              if (anchor) {
                anchor.attrs.id = point.id
              }
            }

            if (idMap.has(point.groupId)) {
              point.groupId = idMap.get(point.groupId)
            }
          }
        }

        if (Array.isArray(asset.children)) {
          deepAssets.push(...asset.children)
        }
      }
    }
  }

  // 把深层 group 的 id 统一为顶层 group 的 id
  groupIdCover(group: Konva.Group) {
    const groupId = group.id()
    const subGroups = group.find('.sub-asset') as Konva.Group[]
    while (subGroups.length > 0) {
      const subGroup = subGroups.shift() as Konva.Group | undefined
      if (subGroup) {
        const points = subGroup.attrs.points
        if (Array.isArray(points)) {
          for (const point of points) {
            point.rawGroupId = point.groupId
            point.groupId = groupId
            for (const pair of point.pairs) {
              pair.from.rawGroupId = pair.from.groupId
              pair.from.groupId = groupId
              pair.to.rawGroupId = pair.to.groupId
              pair.to.groupId = groupId
            }
          }
        }

        subGroups.push(...(subGroup.find('.sub-asset') as Konva.Group[]))
      }
    }
  }

  // 选中连接线
  linkCurrent: Konva.Line | undefined = undefined

  // 选中
  select(link: Konva.Line) {
    this.render.selectionTool.selectingClear()

    this.linkCurrent = link
    this.render.emit('link-selection-change', this.linkCurrent)

    // 重绘
    this.render.redraw([
      Draws.LinkDraw.name, // 更新连线
      Draws.RulerDraw.name // 更新比例尺
    ])
  }

  // 清空选中
  selectingClear() {
    this.linkCurrent = undefined
    this.render.emit('link-selection-change', undefined)

    // 重绘
    this.render.redraw([
      Draws.LinkDraw.name, // 更新连线
      Draws.RulerDraw.name
    ])
  }
}

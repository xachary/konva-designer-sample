import _ from 'lodash-es'
import Konva from 'konva'
//
import * as Types from '../types'
import * as Draws from '../draws'
import { nanoid } from 'nanoid'

// import { AStarFinder } from 'astar-typescript-cost'

import aStar from '../utils/aStar'

export interface LinkDrawOption {
  size: number
}

// 连接对
export interface LinkDrawPair {
  id: string
  from: {
    groupId: string
    pointId: string
  }
  to: {
    groupId: string
    pointId: string
  }
}

// 连接点
export interface LinkDrawPoint {
  id: string
  groupId: string
  visible: boolean
  pairs: LinkDrawPair[]
  x: number
  y: number
  direction?: 'top' | 'bottom' | 'left' | 'right' // 人为定义连接点属于元素的什么方向
}

// 连接线（临时）
export interface LinkDrawState {
  linkingLine: {
    group: Konva.Group
    circle: Konva.Circle
    line: Konva.Line
  } | null
}

type Area = {
  x1: number
  y1: number
  x2: number
  y2: number
}

export class LinkDraw extends Types.BaseDraw implements Types.Draw {
  static override readonly name = 'Link'

  option: LinkDrawOption

  state: LinkDrawState = {
    linkingLine: null
  }

  on = {}

  constructor(render: Types.Render, layer: Konva.Layer, option: LinkDrawOption) {
    super(render, layer)

    this.option = option

    this.group.name(this.constructor.name)
  }

  // 元素（连接点们）最小区域（绝对值）
  getGroupLinkArea(group?: Konva.Group): Area {
    let area: Area = {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0
    }

    if (group) {
      // stage 状态
      const stageState = this.render.getStageState()

      const anchors = group.find('.link-anchor')

      const positions = anchors.map((o) => o.absolutePosition())

      area = {
        x1: Math.min(...positions.map((o) => o.x)) - stageState.x,
        y1: Math.min(...positions.map((o) => o.y)) - stageState.y,
        x2: Math.max(...positions.map((o) => o.x)) - stageState.x,
        y2: Math.max(...positions.map((o) => o.y)) - stageState.y
      }

      if (this.render.debug) {
        const shape = new Konva.Rect({
          x: this.render.toStageValue(area.x1),
          y: this.render.toStageValue(area.y1),
          width: this.render.toStageValue(area.x2 - area.x1),
          height: this.render.toStageValue(area.y2 - area.y1),
          stroke: 'rgba(255,0,0,0.5)',
          strokeWidth: 1,
          listening: false
        })
        this.group.add(shape)
        shape.zIndex(0)
      }
    }

    return area
  }

  // 连线不可通过区域
  getGroupForbiddenArea(groupArea: Area, gap: number): Area {
    const area: Area = {
      x1: groupArea.x1 - gap,
      y1: groupArea.y1 - gap,
      x2: groupArea.x2 + gap,
      y2: groupArea.y2 + gap
    }

    if (this.render.debug) {
      const shape = new Konva.Rect({
        x: this.render.toStageValue(area.x1),
        y: this.render.toStageValue(area.y1),
        width: this.render.toStageValue(area.x2 - area.x1),
        height: this.render.toStageValue(area.y2 - area.y1),
        stroke: 'rgba(0,0,255,0.5)',
        strokeWidth: 1,
        listening: false
      })
      this.group.add(shape)
      shape.zIndex(0)
    }

    return area
  }

  // 连线通过区域
  getGroupAccessArea(groupArea: Area, gap: number): Area {
    const area: Area = {
      x1: groupArea.x1 - gap,
      y1: groupArea.y1 - gap,
      x2: groupArea.x2 + gap,
      y2: groupArea.y2 + gap
    }

    if (this.render.debug) {
      const shape = new Konva.Rect({
        x: this.render.toStageValue(area.x1),
        y: this.render.toStageValue(area.y1),
        width: this.render.toStageValue(area.x2 - area.x1),
        height: this.render.toStageValue(area.y2 - area.y1),
        stroke: 'rgba(255,0,255,0.5)',
        strokeWidth: 1,
        listening: false
      })
      this.group.add(shape)
      shape.zIndex(0)
    }

    return area
  }

  // 两区域扩展
  getGroupPairArea(groupArea1: Area, groupArea2: Area): Area {
    const area: Area = {
      x1: Math.min(groupArea1.x1, groupArea2.x1),
      y1: Math.min(groupArea1.y1, groupArea2.y1),
      x2: Math.max(groupArea1.x2, groupArea2.x2),
      y2: Math.max(groupArea1.y2, groupArea2.y2)
    }

    if (this.render.debug) {
      const shape = new Konva.Rect({
        x: this.render.toStageValue(area.x1),
        y: this.render.toStageValue(area.y1),
        width: this.render.toStageValue(area.x2 - area.x1),
        height: this.render.toStageValue(area.y2 - area.y1),
        stroke: 'rgba(0,120,0,0.5)',
        strokeWidth: 1,
        listening: false
      })
      this.group.add(shape)
      shape.zIndex(1)
    }

    return area
  }

  // 两区域最短距离
  getGroupPairDistance(groupArea1: Area, groupArea2: Area): number {
    const xs = [groupArea1.x1, groupArea1.x2, groupArea2.x1, groupArea2.x2]
    const maxX = Math.max(...xs)
    const minX = Math.min(...xs)
    const dx = maxX - minX - (groupArea1.x2 - groupArea1.x1 + (groupArea2.x2 - groupArea2.x1))

    const ys = [groupArea1.y1, groupArea1.y2, groupArea2.y1, groupArea2.y2]
    const maxY = Math.max(...ys)
    const minY = Math.min(...ys)
    const dy = maxY - minY - (groupArea1.y2 - groupArea1.y1 + (groupArea2.y2 - groupArea2.y1))
    //
    return this.render.toBoardValue(
      Math.min(this.render.bgSize * 0.5, Math.max(dx < 6 ? 6 : dx, dy < 6 ? 6 : dy) * 0.5)
    )
  }

  // 两区域空隙中点
  getGroupPairCenter(groupArea1: Area, groupArea2: Area): Konva.Vector2d {
    return { x: (groupArea2.x1 + groupArea1.x2) * 0.5, y: (groupArea2.y1 + groupArea1.y2) * 0.5 }
  }

  // 连接出入口
  getEntry(anchor: Konva.Node, groupForbiddenArea: Area, gap: number): Konva.Vector2d {
    // stage 状态
    const stageState = this.render.getStageState()

    const fromPos = anchor.absolutePosition()

    // 默认为 起点/终点 位置（无 direction 时的值）
    let x = fromPos.x - stageState.x,
      y = fromPos.y - stageState.y

    const direction = anchor.attrs.direction

    // 定义了 direction 的时候
    if (direction) {
      // 取整 连接点 锚点 旋转角度（保留 1 位小数点）
      const rotate = Math.round(anchor.getAbsoluteRotation() * 10) / 10

      // 利用三角函数，计算按 direction 方向与 不可通过区域 的相交点位置（即出/入口 entry）
      // 如（假设-为起点、#为出/口、x为墙）：
      // x # x           x x #
      // x - x -> 45° -> x - x
      // x x x           x x x
      //
      // x # x           x x x
      // x - x -> 90° -> x - #
      // x x x           x x x
      //
      // x # x            x x x
      // x - x -> 135° -> x - x
      // x x x            x x #
      if (rotate === -45) {
        if (direction === 'top') {
          x = groupForbiddenArea.x1
          y = groupForbiddenArea.y1
        } else if (direction === 'bottom') {
          x = groupForbiddenArea.x2
          y = groupForbiddenArea.y2
        } else if (direction === 'left') {
          x = groupForbiddenArea.x1
          y = groupForbiddenArea.y2
        } else if (direction === 'right') {
          x = groupForbiddenArea.x2
          y = groupForbiddenArea.y1
        }
      } else if (rotate === 45) {
        if (direction === 'top') {
          x = groupForbiddenArea.x2
          y = groupForbiddenArea.y1
        } else if (direction === 'bottom') {
          x = groupForbiddenArea.x1
          y = groupForbiddenArea.y2
        } else if (direction === 'left') {
          x = groupForbiddenArea.x1
          y = groupForbiddenArea.y1
        } else if (direction === 'right') {
          x = groupForbiddenArea.x2
          y = groupForbiddenArea.y2
        }
      } else if (rotate === 135) {
        if (direction === 'top') {
          x = groupForbiddenArea.x2
          y = groupForbiddenArea.y2
        } else if (direction === 'bottom') {
          x = groupForbiddenArea.x1
          y = groupForbiddenArea.y1
        } else if (direction === 'left') {
          x = groupForbiddenArea.x2
          y = groupForbiddenArea.y1
        } else if (direction === 'right') {
          x = groupForbiddenArea.x1
          y = groupForbiddenArea.y2
        }
      } else if (rotate === -135) {
        if (direction === 'top') {
          x = groupForbiddenArea.x1
          y = groupForbiddenArea.y2
        } else if (direction === 'bottom') {
          x = groupForbiddenArea.x2
          y = groupForbiddenArea.y1
        } else if (direction === 'left') {
          x = groupForbiddenArea.x2
          y = groupForbiddenArea.y2
        } else if (direction === 'right') {
          x = groupForbiddenArea.x1
          y = groupForbiddenArea.y1
        }
      } else if (rotate > -45 && rotate < 45) {
        const offset = gap * Math.tan((rotate * Math.PI) / 180)
        if (direction === 'top') {
          x = fromPos.x - stageState.x + offset
          y = groupForbiddenArea.y1
        } else if (direction === 'bottom') {
          x = fromPos.x - stageState.x - offset
          y = groupForbiddenArea.y2
        } else if (direction === 'left') {
          x = groupForbiddenArea.x1
          y = fromPos.y - stageState.y - offset
        } else if (direction === 'right') {
          x = groupForbiddenArea.x2
          y = fromPos.y - stageState.y + offset
        }
      } else if (rotate > 45 && rotate < 135) {
        const offset = gap * Math.atan(((90 - rotate) * Math.PI) / 180)
        if (direction === 'top') {
          x = groupForbiddenArea.x2
          y = fromPos.y - stageState.y - offset
        } else if (direction === 'bottom') {
          x = groupForbiddenArea.x1
          y = fromPos.y - stageState.y + offset
        } else if (direction === 'left') {
          x = fromPos.x - stageState.x - offset
          y = groupForbiddenArea.y1
        } else if (direction === 'right') {
          x = fromPos.x - stageState.x + offset
          y = groupForbiddenArea.y2
        }
      } else if ((rotate > 135 && rotate <= 180) || (rotate >= -180 && rotate < -135)) {
        const offset = gap * Math.tan((rotate * Math.PI) / 180)
        if (direction === 'top') {
          x = fromPos.x - stageState.x - offset
          y = groupForbiddenArea.y2
        } else if (direction === 'bottom') {
          x = fromPos.x - stageState.x + offset
          y = groupForbiddenArea.y1
        } else if (direction === 'left') {
          x = groupForbiddenArea.x2
          y = fromPos.y - stageState.y + offset
        } else if (direction === 'right') {
          x = groupForbiddenArea.x1
          y = fromPos.y - stageState.y - offset
        }
      } else if (rotate > -135 && rotate < -45) {
        const offset = gap * Math.atan(((90 + rotate) * Math.PI) / 180)
        if (direction === 'top') {
          x = groupForbiddenArea.x1
          y = fromPos.y - stageState.y - offset
        } else if (direction === 'bottom') {
          x = groupForbiddenArea.x2
          y = fromPos.y - stageState.y + offset
        } else if (direction === 'left') {
          x = fromPos.x - stageState.x - offset
          y = groupForbiddenArea.y2
        } else if (direction === 'right') {
          x = fromPos.x - stageState.x + offset
          y = groupForbiddenArea.y1
        }
      }
    }

    return { x, y } as Konva.Vector2d
  }

  // 连接点信息
  getAnchorPos(anchor?: Konva.Node): Konva.Vector2d {
    // stage 状态
    const stageState = this.render.getStageState()

    return anchor
      ? {
          x: anchor.absolutePosition().x - stageState.x,
          y: anchor.absolutePosition().y - stageState.y
        }
      : { x: 0, y: 0 }
  }

  override draw() {
    this.clear()

    // stage 状态
    const stageState = this.render.getStageState()

    const groups = this.render.layer.find('.asset') as Konva.Group[]

    const points = groups.reduce((ps, group) => {
      return ps.concat(Array.isArray(group.getAttr('points')) ? group.getAttr('points') : [])
    }, [] as LinkDrawPoint[])

    const pairs = points.reduce((ps, point) => {
      return ps.concat(point.pairs ? point.pairs : [])
    }, [] as LinkDrawPair[])

    if (this.render.debug && pairs.length > 0) {
      console.log('')
      console.log('link draw')
    }

    // 连接线
    for (const pair of pairs) {
      const fromGroup = groups.find((o) => o.id() === pair.from.groupId)
      const fromPoint = points.find((o) => o.id === pair.from.pointId)

      const toGroup = groups.find((o) => o.id() === pair.to.groupId)
      const toPoint = points.find((o) => o.id === pair.to.pointId)

      // 最小区域
      const fromGroupLinkArea = this.getGroupLinkArea(fromGroup)
      const toGroupLinkArea = this.getGroupLinkArea(toGroup)

      // 两区域的最短距离
      const groupDistance = this.getGroupPairDistance(fromGroupLinkArea, toGroupLinkArea)

      // 不可通过区域
      const fromGroupForbiddenArea = this.getGroupForbiddenArea(
        fromGroupLinkArea,
        groupDistance - 2
      )
      const toGroupForbiddenArea = this.getGroupForbiddenArea(toGroupLinkArea, groupDistance - 2)

      // 两区域扩展
      const groupForbiddenArea = this.getGroupPairArea(fromGroupForbiddenArea, toGroupForbiddenArea)

      // 连线通过区域
      const groupAccessArea = this.getGroupPairArea(
        this.getGroupAccessArea(fromGroupForbiddenArea, groupDistance),
        this.getGroupAccessArea(toGroupForbiddenArea, groupDistance)
      )

      if (fromGroup && toGroup && fromPoint && toPoint) {
        const fromAnchor = fromGroup.findOne(`#${fromPoint.id}`)
        const toAnchor = toGroup.findOne(`#${toPoint.id}`)

        // 锚点信息
        const fromAnchorPos = this.getAnchorPos(fromAnchor)
        const toAnchorPos = this.getAnchorPos(toAnchor)

        if (fromAnchor && toAnchor) {
          if (this.render.debug) {
            console.log('distance', groupDistance)
          }

          // 连接出入口
          const fromEntry: Konva.Vector2d = this.getEntry(
            fromAnchor,
            fromGroupForbiddenArea,
            groupDistance
          )
          const toEntry: Konva.Vector2d = this.getEntry(
            toAnchor,
            toGroupForbiddenArea,
            groupDistance
          )

          type matrixPoint = {
            x: number
            y: number
            type?: 'from' | 'to' | 'from-entry' | 'to-entry'
          }
          // 可能点
          let matrixPoints: matrixPoint[] = []

          // 通过区域 四角
          matrixPoints.push({ x: groupAccessArea.x1, y: groupAccessArea.y1 })
          matrixPoints.push({ x: groupAccessArea.x2, y: groupAccessArea.y2 })
          matrixPoints.push({ x: groupAccessArea.x1, y: groupAccessArea.y2 })
          matrixPoints.push({ x: groupAccessArea.x2, y: groupAccessArea.y1 })

          // 最小区域 四角
          matrixPoints.push({ x: groupForbiddenArea.x1, y: groupForbiddenArea.y1 })
          matrixPoints.push({ x: groupForbiddenArea.x2, y: groupForbiddenArea.y2 })
          matrixPoints.push({ x: groupForbiddenArea.x1, y: groupForbiddenArea.y2 })
          matrixPoints.push({ x: groupForbiddenArea.x2, y: groupForbiddenArea.y1 })

          // 起点
          matrixPoints.push({
            ...fromAnchorPos,
            type: 'from'
          })
          // 起点 出口
          matrixPoints.push({ ...fromEntry, type: 'from-entry' })

          // 终点
          matrixPoints.push({
            ...toAnchorPos,
            type: 'to'
          })
          // 终点 入口
          matrixPoints.push({ ...toEntry, type: 'to-entry' })

          // 通过区域 中点
          matrixPoints.push(this.getGroupPairCenter(fromGroupForbiddenArea, toGroupForbiddenArea))

          // 去重
          matrixPoints = matrixPoints.reduce(
            (arr, item) => {
              if (item.type === void 0) {
                if (arr.findIndex((o) => o.x === item.x && o.y === item.y) < 0) {
                  arr.push(item)
                }
              } else {
                const idx = arr.findIndex((o) => o.x === item.x && o.y === item.y)
                if (idx > -1) {
                  arr.splice(idx, 1)
                }
                arr.push(item)
              }

              return arr
            },
            [] as typeof matrixPoints
          )

          const columns = [
            ...matrixPoints.map((o) => o.x),
            // 增加列
            fromGroupForbiddenArea.x1,
            fromGroupForbiddenArea.x2,
            toGroupForbiddenArea.x1,
            toGroupForbiddenArea.x2
          ].sort((a, b) => a - b)

          // 去重
          for (let x = columns.length - 1; x > 0; x--) {
            if (columns[x] === columns[x - 1]) {
              columns.splice(x, 1)
            }
          }

          if (this.render.debug) {
            console.log('columns', columns)
          }

          const rows = [
            ...matrixPoints.map((o) => o.y),
            // 增加行
            fromGroupForbiddenArea.y1,
            fromGroupForbiddenArea.y2,
            toGroupForbiddenArea.y1,
            toGroupForbiddenArea.y2
          ].sort((a, b) => a - b)

          // 去重
          for (let y = rows.length - 1; y > 0; y--) {
            if (rows[y] === rows[y - 1]) {
              rows.splice(y, 1)
            }
          }

          if (this.render.debug) {
            console.log('rows', rows)
          }

          // 屏蔽区域（序号）
          const columnFromStart = columns.findIndex((o) => o === fromGroupForbiddenArea.x1)
          const columnFromEnd = columns.findIndex((o) => o === fromGroupForbiddenArea.x2)
          const rowFromStart = rows.findIndex((o) => o === fromGroupForbiddenArea.y1)
          const rowFromEnd = rows.findIndex((o) => o === fromGroupForbiddenArea.y2)

          const columnToStart = columns.findIndex((o) => o === toGroupForbiddenArea.x1)
          const columnToEnd = columns.findIndex((o) => o === toGroupForbiddenArea.x2)
          const rowToStart = rows.findIndex((o) => o === toGroupForbiddenArea.y1)
          const rowToEnd = rows.findIndex((o) => o === toGroupForbiddenArea.y2)

          // 算法矩阵起点、终点
          let matrixStart: Konva.Vector2d | null = null
          let matrixEnd: Konva.Vector2d | null = null

          // 算法地图矩阵
          const matrix: Array<number[]> = []

          for (let y = 0; y < rows.length; y++) {
            // 新增行
            if (matrix[y] === void 0) {
              matrix[y] = []
            }

            for (let x = 0; x < columns.length; x++) {
              // 不可通过区域
              if (
                x >= columnFromStart &&
                x <= columnFromEnd &&
                y >= rowFromStart &&
                y <= rowFromEnd
              ) {
                matrix[y][x] = 2
              } else if (
                x >= columnToStart &&
                x <= columnToEnd &&
                y >= rowToStart &&
                y <= rowToEnd
              ) {
                matrix[y][x] = 2
              } else {
                // 可通过区域
                matrix[y][x] = 0
              }

              // 出口、入口 -> 算法 起点、终点

              if (columns[x] === fromEntry.x && rows[y] === fromEntry.y) {
                matrix[y][x] = 1
                matrixStart = { x, y }
              }

              if (columns[x] === toEntry.x && rows[y] === toEntry.y) {
                matrix[y][x] = 1
                matrixEnd = { x, y }
              }

              // 没有定义方向（给于十字可通过区域）
              // 如，从：
              // 1 1 1
              // 1 0 1
              // 1 1 1
              // 变成：
              // 1 0 1
              // 0 0 0
              // 1 0 1
              if (!fromAnchor.attrs.direction) {
                if (columns[x] === fromEntry.x || rows[y] === fromEntry.y) {
                  if (
                    x >= columnFromStart &&
                    x <= columnFromEnd &&
                    y >= rowFromStart &&
                    y <= rowFromEnd
                  ) {
                    matrix[y][x] = 1
                  }
                }
              }
              if (!toAnchor.attrs.direction) {
                if (columns[x] === toEntry.x || rows[y] === toEntry.y) {
                  if (x >= columnToStart && x <= columnToEnd && y >= rowToStart && y <= rowToEnd) {
                    matrix[y][x] = 1
                  }
                }
              }
            }
          }

          if (this.render.debug) {
            console.log('matrix', matrix)
          }

          if (this.render.debug) {
            for (const point of matrixPoints) {
              this.group.add(
                new Konva.Circle({
                  name: 'link-route',
                  id: nanoid(),
                  x: this.render.toStageValue(point.x),
                  y: this.render.toStageValue(point.y),
                  radius: this.render.toStageValue(3),
                  stroke:
                    point.type === void 0
                      ? 'rgba(0,0,255,1)'
                      : ['from', 'to'].includes(point.type)
                        ? 'rgba(255,0,0,1)'
                        : 'rgba(0,120,0,1)',
                  strokeWidth: this.render.toStageValue(1)
                })
              )
            }
          }

          // A Star 算法，“曼哈顿距离”作为启发
          // const aStar = new AStarFinder({
          //   diagonalAllowed: false,
          //   heuristic: 'Manhattan',
          //   grid: {
          //     matrix,
          //     maxCost: 2
          //   },
          //   includeStartNode: true,
          //   includeEndNode: true
          // })

          // A Star 双向，不支持代价 Cost
          // const aStarBi = new window.PF.BiAStarFinder()

          if (matrixStart && matrixEnd) {
            console.log('算法起点', matrixStart, '算法终点', matrixEnd)

            // const way = aStar.findPath(matrixStart, matrixEnd)

            // const way: number[][] = aStarBi.findPath(
            //   matrixStart.x,
            //   matrixStart.y,
            //   matrixEnd.x,
            //   matrixEnd.y,
            //   new window.PF.Grid(columns.length, rows.length, matrix)
            // )

            const way = aStar({
              from: matrixStart,
              to: matrixEnd,
              matrix,
              maxCost: 2
            })

            this.group.add(
              new Konva.Line({
                name: 'link-line',
                // 用于删除连接线
                groupId: fromGroup.id(),
                pointId: fromPoint.id,
                pairId: pair.id,
                //
                points: _.flatten([
                  [
                    this.render.toStageValue(fromAnchorPos.x),
                    this.render.toStageValue(fromAnchorPos.y)
                  ], // 补充 起点
                  ...way.map((o) => [
                    this.render.toStageValue(columns[o.x]),
                    this.render.toStageValue(rows[o.y])
                  ]),
                  [this.render.toStageValue(toAnchorPos.x), this.render.toStageValue(toAnchorPos.y)] // 补充 终点
                ]),
                stroke: 'red',
                strokeWidth: 2
              })
            )
          }
        }
      }
    }

    // 连接点
    for (const point of points) {
      const group = groups.find((o) => o.id() === point.groupId)

      // 非 选择中
      if (group && !group.getAttr('selected')) {
        const anchor = this.render.layer.findOne(`#${point.id}`)

        if (anchor) {
          const circle = new Konva.Circle({
            id: point.id,
            groupId: group.id(),
            x: this.render.toStageValue(anchor.absolutePosition().x - stageState.x),
            y: this.render.toStageValue(anchor.absolutePosition().y - stageState.y),
            radius: this.render.toStageValue(this.option.size),
            stroke: 'rgba(255,0,0,0.2)',
            strokeWidth: this.render.toStageValue(1),
            name: 'link-point',
            opacity: point.visible ? 1 : 0
          })

          // hover 效果
          circle.on('mouseenter', () => {
            circle.stroke('rgba(255,0,0,0.5)')
            circle.opacity(1)
            document.body.style.cursor = 'pointer'
          })
          circle.on('mouseleave', () => {
            circle.stroke('rgba(255,0,0,0.2)')
            circle.opacity(0)
            document.body.style.cursor = 'default'
          })

          circle.on('mousedown', () => {
            this.render.selectionTool.selectingClear()

            const pos = this.render.stage.getPointerPosition()

            if (pos) {
              // 临时 连接线 画
              this.state.linkingLine = {
                group: group,
                circle: circle,
                line: new Konva.Line({
                  name: 'linking-line',
                  points: _.flatten([
                    [circle.x(), circle.y()],
                    [
                      this.render.toStageValue(pos.x - stageState.x),
                      this.render.toStageValue(pos.y - stageState.y)
                    ]
                  ]),
                  stroke: 'blue',
                  strokeWidth: 1
                })
              }

              this.layer.add(this.state.linkingLine.line)
            }
          })

          circle.on('mouseup', () => {
            if (this.state.linkingLine) {
              const line = this.state.linkingLine
              // 不同连接点
              if (line.circle.id() !== circle.id()) {
                const toGroup = groups.find((o) => o.id() === circle.getAttr('groupId'))

                if (toGroup) {
                  const fromPoints = (
                    Array.isArray(line.group.getAttr('points')) ? line.group.getAttr('points') : []
                  ) as LinkDrawPoint[]

                  const fromPoint = fromPoints.find((o) => o.id === line.circle.id())

                  if (fromPoint) {
                    const toPoints = (
                      Array.isArray(toGroup.getAttr('points')) ? toGroup.getAttr('points') : []
                    ) as LinkDrawPoint[]

                    const toPoint = toPoints.find((o) => o.id === circle.id())

                    if (toPoint) {
                      if (Array.isArray(fromPoint.pairs)) {
                        fromPoint.pairs = [
                          ...fromPoint.pairs,
                          {
                            id: nanoid(),
                            from: {
                              groupId: line.group.id(),
                              pointId: line.circle.id()
                            },
                            to: {
                              groupId: circle.getAttr('groupId'),
                              pointId: circle.id()
                            }
                          }
                        ]
                      }

                      // 更新历史
                      this.render.updateHistory()
                      this.draw()
                      // 更新预览
                      this.render.draws[Draws.PreviewDraw.name].draw()
                    }
                  }
                }
              }

              // 临时 连接线 移除
              this.state.linkingLine?.line.destroy()
              this.state.linkingLine = null
            }
          })

          this.group.add(circle)
        }
      }
    }
  }
}

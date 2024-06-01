import _ from 'lodash-es'
import Konva from 'konva'
//
import * as Types from '../types'
import * as Draws from '../draws'

export interface LinkDrawOption {
  size: number
}

export interface LinkDrawPair {
  type: 'from' | 'to'
  from: {
    groupId: string
    pointId: string
    pointAbsX: number
    pointAbsY: number
  }
  to: {
    groupId: string
    pointId: string
    pointAbsX: number
    pointAbsY: number
  }
}

export interface LinkDrawPoint {
  id: string
  groupId: string
  visible: boolean
  pairs: LinkDrawPair[]
  x: number
  y: number
}

export interface LinkDrawState {
  linkingLine: {
    group: Konva.Group
    circle: Konva.Circle
    line: Konva.Line
  } | null
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

    // 连接线
    for (const pair of pairs) {
      if (pair.type === 'from') {
        const fromGroup = groups.find((o) => o.id() === pair.from.groupId)
        const fromPoint = points.find((o) => o.id === pair.from.pointId)

        const toGroup = groups.find((o) => o.id() === pair.to.groupId)
        const toPoint = points.find((o) => o.id === pair.to.pointId)

        if (fromGroup && toGroup && fromPoint && toPoint) {
          const fromAnchor = this.render.layer.findOne(`#${fromPoint.id}`)
          const toAnchor = this.render.layer.findOne(`#${toPoint.id}`)

          if (fromAnchor && toAnchor) {
            this.group.add(
              new Konva.Line({
                name: 'link-line',
                points: _.flatten([
                  [
                    this.render.toStageValue(fromAnchor.absolutePosition().x - stageState.x),
                    this.render.toStageValue(fromAnchor.absolutePosition().y - stageState.y)
                  ],
                  [
                    this.render.toStageValue(toAnchor.absolutePosition().x - stageState.x),
                    this.render.toStageValue(toAnchor.absolutePosition().y - stageState.y)
                  ]
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

      if (group) {
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
                            type: 'from',
                            from: {
                              groupId: line.group.id(),
                              pointId: line.circle.id(),
                              pointAbsX: line.circle.absolutePosition().x,
                              pointAbsY: line.circle.absolutePosition().y
                            },
                            to: {
                              groupId: circle.getAttr('groupId'),
                              pointId: circle.id(),
                              pointAbsX: circle.absolutePosition().x,
                              pointAbsY: circle.absolutePosition().y
                            }
                          }
                        ]
                      }

                      if (Array.isArray(toPoint.pairs)) {
                        toPoint.pairs = [
                          ...toPoint.pairs,
                          {
                            type: 'to',
                            from: {
                              groupId: line.group.id(),
                              pointId: line.circle.id(),
                              pointAbsX: line.circle.absolutePosition().x,
                              pointAbsY: line.circle.absolutePosition().y
                            },
                            to: {
                              groupId: circle.getAttr('groupId'),
                              pointId: circle.id(),
                              pointAbsX: circle.absolutePosition().x,
                              pointAbsY: circle.absolutePosition().y
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
              this.state.linkingLine?.line.remove()
              this.state.linkingLine = null
            }
          })

          this.group.add(circle)
        }
      }
    }
  }
}

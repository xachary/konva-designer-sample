import Konva from 'konva'
//
import { Render } from '../index'
import * as Types from '../types'
import * as Draws from '../draws'

export class SelectionHandlers implements Types.Handler {
  static readonly name = 'Selection'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  // selectRect 拉动的开始和结束坐标
  selectRectStartX = 0
  selectRectStartY = 0
  selectRectEndX = 0
  selectRectEndY = 0
  // 是否正在使用 selectRect
  selecting = false

  // 拖动前的位置
  transformerMousedownPos: Konva.Vector2d = { x: 0, y: 0 }

  // 对齐线
  alignLines: Konva.Line[] = []

  // 对齐线清除
  alignLinesClear() {
    for (const line of this.alignLines) {
      line.destroy()
    }
    this.alignLines = []
  }

  // 通过偏移量移动【目标节点】
  selectingNodesPositionByOffset(offset: Konva.Vector2d) {
    for (const node of this.render.selectionTool.selectingNodes) {
      if (node.attrs.nodeMousedownPos) {
        const x = node.attrs.nodeMousedownPos.x + offset.x
        const y = node.attrs.nodeMousedownPos.y + offset.y
        node.x(x)
        node.y(y)
      }
    }
  }

  // 重置【目标节点】的 nodeMousedownPos
  selectingNodesPositionReset() {
    for (const node of this.render.selectionTool.selectingNodes) {
      if (node.attrs.nodeMousedownPos) {
        node.attrs.nodeMousedownPos.x = node.x()
        node.attrs.nodeMousedownPos.y = node.y()
      }
    }
  }

  // 重置 transformer 状态
  transformerStateReset() {
    // 记录 transformer pos
    const rect = this.render.transformer.findOne('.back')!.getClientRect()
    this.transformerMousedownPos = { x: rect.x, y: rect.y }

    // 记录 拐点 移动之前的 坐标
    const groups = this.render.transformer.nodes()

    const points = groups.reduce((ps, group) => {
      return ps.concat(Array.isArray(group.getAttr('points')) ? group.getAttr('points') : [])
    }, [] as Types.LinkDrawPoint[])

    const pairs = points.reduce((ps, point) => {
      return ps.concat(point.pairs ? point.pairs.filter((o) => !o.disabled) : [])
    }, [] as Types.LinkDrawPair[])

    for (const pair of pairs) {
      const fromGroup = groups.find((o) => o.id() === pair.from.groupId)
      const toGroup = groups.find((o) => o.id() === pair.to.groupId)
      // 必须成对移动才记录
      if (fromGroup && toGroup) {
        // 移动之前的 坐标
        fromGroup.setAttr(
          'manualPointsMapBefore',
          fromGroup.getAttr('manualPointsMap') ?? ({} as Types.ManualPointsMap)
        )
      }
    }
  }

  // 重置
  reset() {
    // 对齐线清除
    this.render.attractTool.alignLinesClear()

    this.transformerStateReset()
    this.selectingNodesPositionReset()
  }

  /**
   * 矩阵变换：坐标系中的一个点，围绕着另外一个点进行旋转
   * -  -   -        - -   -   - -
   * |x`|   |cos -sin| |x-a|   |a|
   * |  | = |        | |   | +
   * |y`|   |sin  cos| |y-b|   |b|
   * -  -   -        - -   -   - -
   * @param x 目标节点坐标 x
   * @param y 目标节点坐标 y
   * @param centerX 围绕的点坐标 x
   * @param centerY 围绕的点坐标 y
   * @param angle 旋转角度
   * @returns
   */
  rotatePoint(x: number, y: number, centerX: number, centerY: number, angle: number) {
    // 将角度转换为弧度
    const radians = (angle * Math.PI) / 180

    // 计算旋转后的坐标
    const newX = Math.cos(radians) * (x - centerX) - Math.sin(radians) * (y - centerY) + centerX
    const newY = Math.sin(radians) * (x - centerX) + Math.cos(radians) * (y - centerY) + centerY

    return { x: newX, y: newY }
  }

  lastRotation = 0

  handlers = {
    // 选择相关
    stage: {
      mousedown: (e: Konva.KonvaEventObject<GlobalEventHandlersEventMap['mousedown']>) => {
        if (!this.render.graphType) {
          // 并非在新建并拖动图形

          const parent = e.target.getParent()

          if (e.target === this.render.stage) {
            // 点击空白处

            // 清除选择
            this.render.selectionTool.selectingClear()
            this.render.linkTool.selectingClear()

            // 选择框（判断 ctrlKey 为了排查 mac 拖动快捷键）
            if (e.evt.button === Types.MouseButton.左键 && !e.evt.ctrlKey) {
              const pos = this.render.stage.getPointerPosition()
              if (pos) {
                // 初始化状态值
                this.selectRectStartX = pos.x
                this.selectRectStartY = pos.y
                this.selectRectEndX = pos.x
                this.selectRectEndY = pos.y
              }

              // 初始化大小
              this.render.selectRect.width(0)
              this.render.selectRect.height(0)

              // 开始选择
              this.selecting = true
            }

            // 隐藏连接点
            this.render.linkTool.pointsVisible(false)
          } else if (parent instanceof Konva.Transformer) {
            // transformer 点击事件交给 transformer 自己的 handler
          } else if (parent instanceof Konva.Group) {
            // （判断 ctrlKey 为了排查 mac 拖动快捷键）
            if (e.evt.button === Types.MouseButton.左键 && !e.evt.ctrlKey) {
              if (!this.render.ignore(parent) && !this.render.ignoreDraw(e.target)) {
                if (e.evt.ctrlKey || e.evt.metaKey) {
                  // 新增多选
                  this.render.selectionTool.select([
                    ...this.render.selectionTool.selectingNodes,
                    parent
                  ])
                } else {
                  // 单选
                  this.render.selectionTool.select([parent])

                  // 单选时无法通过 transformer 获取拖动初始位置 transformerMousedownPos
                  // 此时直接取目标的 getClientRect 位置
                  const rect = parent.getClientRect()
                  this.transformerMousedownPos = { x: rect.x, y: rect.y }
                }
              }
            } else {
              this.render.selectionTool.selectingClear()
            }
          }
        }
      },
      mousemove: () => {
        // stage 状态
        const stageState = this.render.getStageState()

        // 选择框
        if (this.selecting) {
          // 选择区域中
          const pos = this.render.stage.getPointerPosition()
          if (pos) {
            // 选择移动后的坐标
            this.selectRectEndX = pos.x
            this.selectRectEndY = pos.y
          }

          // 调整【选择框】的位置和大小
          this.render.selectRect.setAttrs({
            visible: true, // 显示
            x: this.render.toStageValue(
              Math.min(this.selectRectStartX, this.selectRectEndX) - stageState.x
            ),
            y: this.render.toStageValue(
              Math.min(this.selectRectStartY, this.selectRectEndY) - stageState.y
            ),
            width: this.render.toStageValue(Math.abs(this.selectRectEndX - this.selectRectStartX)),
            height: this.render.toStageValue(Math.abs(this.selectRectEndY - this.selectRectStartY))
          })
        }
      },
      mouseup: () => {
        // 选择框

        // 重叠计算
        const box = this.render.selectRect.getClientRect()
        if (box.width > 0 && box.height > 0) {
          // 区域有面积

          // 获取所有图形
          const shapes = this.render.layer.getChildren((node) => {
            return !this.render.ignore(node)
          })

          // 提取重叠部分
          const selected = shapes.filter((shape) =>
            // 关键 api
            Konva.Util.haveIntersection(box, shape.getClientRect())
          )

          // 多选
          this.render.selectionTool.select(selected)
        }

        // 重置
        this.render.selectRect.setAttrs({
          visible: false, // 隐藏
          x: 0,
          y: 0,
          width: 0,
          height: 0
        })

        // 选择区域结束
        this.selecting = false
      }
    },
    transformer: {
      // 记录初始状态
      mousedown: (e: Konva.KonvaEventObject<GlobalEventHandlersEventMap['mousedown']>) => {
        const anchor = this.render.transformer.getActiveAnchor()
        if (!anchor) {
          // 非变换
          if (e.evt.ctrlKey || e.evt.metaKey) {
            // 选择
            if (this.render.selectionTool.selectingNodes.length > 0) {
              const pos = this.render.stage.getPointerPosition()
              if (pos) {
                const keeps: Konva.Node[] = []
                const removes: Konva.Node[] = []

                // 从高到低，逐个判断 已选节点 和 鼠标点击位置 是否重叠
                let finded = false
                for (const node of this.render.selectionTool.selectingNodes.sort(
                  (a, b) => b.zIndex() - a.zIndex()
                )) {
                  if (
                    !finded &&
                    Konva.Util.haveIntersection(node.getClientRect(), {
                      ...pos,
                      width: 1,
                      height: 1
                    })
                  ) {
                    // 记录需要移除选择的节点
                    removes.unshift(node)
                    finded = true
                  } else {
                    keeps.unshift(node)
                  }
                }

                if (removes.length > 0) {
                  // 取消选择
                  this.render.selectionTool.select(keeps)
                } else {
                  // 从高到低，逐个判断 未选节点 和 鼠标点击位置 是否重叠
                  let finded = false
                  const adds: Konva.Node[] = []
                  for (const node of this.render.layer
                    .getChildren()
                    .filter((node) => !this.render.ignore(node))
                    .sort((a, b) => b.zIndex() - a.zIndex())) {
                    if (
                      !finded &&
                      Konva.Util.haveIntersection(node.getClientRect(), {
                        ...pos,
                        width: 1,
                        height: 1
                      })
                    ) {
                      // 记录需要增加选择的节点
                      adds.unshift(node)
                      finded = true
                    }
                  }
                  if (adds.length > 0) {
                    // 新增选择
                    this.render.selectionTool.select([
                      ...this.render.selectionTool.selectingNodes,
                      ...adds
                    ])
                  }
                }
              }
            }
          } else {
            if (this.render.selectionTool.selectingNodes.length > 0) {
              // 拖动前
              // 重置状态
              this.reset()
            }
          }
        } else {
          // 变换前

          // 重置状态
          this.reset()
        }
      },
      transformstart: () => {
        const back = this.render.transformer.findOne('.back')
        if (back) {
          this.lastRotation = back.getAbsoluteRotation()
        }
      },
      transform: () => {
        // 旋转时，拐点也要跟着动
        const back = this.render.transformer.findOne('.back')

        if (back) {
          // stage 状态
          const stageState = this.render.getStageState()

          const { x, y, width, height } = back.getClientRect()
          const rotation = back.getAbsoluteRotation() - this.lastRotation
          const centerX = x + width / 2
          const centerY = y + height / 2

          const groups = this.render.transformer.nodes()

          const points = groups.reduce((ps, group) => {
            return ps.concat(Array.isArray(group.getAttr('points')) ? group.getAttr('points') : [])
          }, [] as Types.LinkDrawPoint[])

          const pairs = points.reduce((ps, point) => {
            return ps.concat(point.pairs ? point.pairs.filter((o) => !o.disabled) : [])
          }, [] as Types.LinkDrawPair[])

          for (const pair of pairs) {
            const fromGroup = groups.find((o) => o.id() === pair.from.groupId)
            const toGroup = groups.find((o) => o.id() === pair.to.groupId)
            // 必须成对移动才记录
            if (fromGroup && toGroup) {
              // 移动
              if (fromGroup.attrs.manualPointsMap && fromGroup.attrs.manualPointsMapBefore) {
                let manualPoints = fromGroup.attrs.manualPointsMap[pair.id]
                const manualPointsBefore = fromGroup.attrs.manualPointsMapBefore[pair.id]
                if (Array.isArray(manualPoints) && Array.isArray(manualPointsBefore)) {
                  manualPoints = manualPointsBefore.map((o: Types.ManualPoint) => {
                    const { x, y } = this.rotatePoint(
                      this.render.toBoardValue(o.x) + stageState.x,
                      this.render.toBoardValue(o.y) + stageState.y,
                      centerX,
                      centerY,
                      rotation
                    )

                    return {
                      x: this.render.toStageValue(x - stageState.x),
                      y: this.render.toStageValue(y - stageState.y)
                    }
                  })

                  fromGroup.setAttr('manualPointsMap', {
                    ...fromGroup.attrs.manualPointsMap,
                    [pair.id]: manualPoints
                  })
                }
              }
            }
          }

          // 更新坐标记录
          for (const group of groups) {
            this.render.setAssetSettings(group, this.render.getAssetSettings(group), false)
          }

          this.render.emit('asset-position-change', groups)
          this.render.emit('asset-rotation-change', groups)
        }

        // 重绘
        this.render.redraw([Draws.GraphDraw.name, Draws.LinkDraw.name, Draws.PreviewDraw.name])
      },
      transformend: () => {
        // 变换结束

        // 重置状态
        this.reset()

        // 更新历史
        this.render.updateHistory()

        // 重绘
        this.render.redraw([Draws.GraphDraw.name, Draws.LinkDraw.name, Draws.PreviewDraw.name])
      },
      //
      dragstart: () => {
        //
      },
      // 拖动
      dragmove: () => {
        const rect = this.render.transformer.findOne('.back')!.getClientRect()

        const { pos: transformerPos, isAttract } = this.render.attractTool.attractTransformer(rect)

        if (isAttract) {
          // 磁吸偏移
          this.selectingNodesPositionByOffset({
            x: this.render.toStageValue(transformerPos.x - this.transformerMousedownPos.x),
            y: this.render.toStageValue(transformerPos.y - this.transformerMousedownPos.y)
          })
        }

        // 拐点也需要移动
        const groups = this.render.transformer.nodes()

        const points = groups.reduce((ps, group) => {
          return ps.concat(Array.isArray(group.getAttr('points')) ? group.getAttr('points') : [])
        }, [] as Types.LinkDrawPoint[])

        const pairs = points.reduce((ps, point) => {
          return ps.concat(point.pairs ? point.pairs.filter((o) => !o.disabled) : [])
        }, [] as Types.LinkDrawPair[])

        for (const pair of pairs) {
          const fromGroup = groups.find((o) => o.id() === pair.from.groupId)
          const toGroup = groups.find((o) => o.id() === pair.to.groupId)
          // 必须成对移动才记录
          if (fromGroup && toGroup) {
            // 移动
            if (fromGroup.attrs.manualPointsMap && fromGroup.attrs.manualPointsMapBefore) {
              let manualPoints = fromGroup.attrs.manualPointsMap[pair.id]
              const manualPointsBefore = fromGroup.attrs.manualPointsMapBefore[pair.id]
              if (Array.isArray(manualPoints) && Array.isArray(manualPointsBefore)) {
                manualPoints = isAttract
                  ? manualPointsBefore.map(
                      (o: Types.ManualPoint) =>
                        ({
                          x:
                            o.x +
                            this.render.toStageValue(
                              transformerPos.x - this.transformerMousedownPos.x
                            ),
                          y:
                            o.y +
                            this.render.toStageValue(
                              transformerPos.y - this.transformerMousedownPos.y
                            )
                        }) as Types.ManualPoint
                    )
                  : manualPointsBefore.map(
                      (o: Types.ManualPoint) =>
                        ({
                          x:
                            o.x + this.render.toStageValue(rect.x - this.transformerMousedownPos.x),
                          y: o.y + this.render.toStageValue(rect.y - this.transformerMousedownPos.y)
                        }) as Types.ManualPoint
                    )

                fromGroup.setAttr('manualPointsMap', {
                  ...fromGroup.attrs.manualPointsMap,
                  [pair.id]: manualPoints
                })
              }
            }
          }
        }

        // 更新坐标记录
        for (const group of groups) {
          this.render.setAssetSettings(group, this.render.getAssetSettings(group), false)
        }

        this.render.emit('asset-position-change', groups)

        // 重绘
        this.render.redraw([
          Draws.GraphDraw.name,
          Draws.LinkDraw.name,
          Draws.RulerDraw.name,
          Draws.PreviewDraw.name
        ])
      },
      dragend: () => {
        // 拖动结束

        // 重置状态
        this.reset()

        // 更新历史
        this.render.updateHistory()

        // 重绘
        this.render.redraw([
          Draws.GraphDraw.name,
          Draws.LinkDraw.name,
          Draws.RulerDraw.name,
          Draws.PreviewDraw.name
        ])
      },
      // 子节点 hover
      mousemove: () => {
        const pos = this.render.stage.getPointerPosition()
        if (pos) {
          // 获取所有图形
          const shapes = this.render.transformer.nodes()

          // 隐藏 hover 框
          for (const shape of shapes) {
            if (shape instanceof Konva.Group) {
              shape.findOne('#hoverRect')?.visible(false)
            }
          }

          // 多选
          if (shapes.length > 1) {
            // zIndex 倒序（大的优先）
            shapes.sort((a, b) => b.zIndex() - a.zIndex())

            // 提取重叠目标
            const selected = shapes.find((shape) =>
              // 关键 api
              Konva.Util.haveIntersection({ ...pos, width: 1, height: 1 }, shape.getClientRect())
            )

            // 显示 hover 框
            if (selected) {
              if (selected instanceof Konva.Group) {
                selected.findOne('#hoverRect')?.visible(true)
              }
            }
          }
        }
      },
      mouseleave: () => {
        // 隐藏 hover 框
        for (const shape of this.render.transformer.nodes()) {
          if (shape instanceof Konva.Group) {
            shape.findOne('#hoverRect')?.visible(false)
          }
        }
      }
    }
  }

  // transformer config
  transformerConfig = {
    // 变换中
    anchorDragBoundFunc: (oldPos: Konva.Vector2d, newPos: Konva.Vector2d) => {
      // 磁贴逻辑

      if (this.render.config.attractResize) {
        // transformer 锚点按钮
        const anchor = this.render.transformer.getActiveAnchor()

        // 非旋转（就是放大缩小时）
        if (anchor && anchor !== 'rotater') {
          // stage 状态
          const stageState = this.render.getStageState()

          const logicX = this.render.toStageValue(newPos.x - stageState.x) // x坐标
          const logicNumX = Math.round(logicX / this.render.bgSize) // x单元格个数
          const logicClosestX = logicNumX * this.render.bgSize // x磁贴目标坐标
          const logicDiffX = Math.abs(logicX - logicClosestX) // x磁贴偏移量
          const snappedX = /-(left|right)$/.test(anchor) && logicDiffX < 5 // x磁贴阈值

          const logicY = this.render.toStageValue(newPos.y - stageState.y) // y坐标
          const logicNumY = Math.round(logicY / this.render.bgSize) // y单元格个数
          const logicClosestY = logicNumY * this.render.bgSize // y磁贴目标坐标
          const logicDiffY = Math.abs(logicY - logicClosestY) // y磁贴偏移量
          const snappedY = /^(top|bottom)-/.test(anchor) && logicDiffY < 5 // y磁贴阈值

          if (snappedX && !snappedY) {
            // x磁贴
            return {
              x: this.render.toBoardValue(logicClosestX) + stageState.x,
              y: oldPos.y
            }
          } else if (snappedY && !snappedX) {
            // y磁贴
            return {
              x: oldPos.x,
              y: this.render.toBoardValue(logicClosestY) + stageState.y
            }
          } else if (snappedX && snappedY) {
            // xy磁贴
            return {
              x: this.render.toBoardValue(logicClosestX) + stageState.x,
              y: this.render.toBoardValue(logicClosestY) + stageState.y
            }
          }
        }
      }

      // 不磁贴
      return newPos
    }
  }
}

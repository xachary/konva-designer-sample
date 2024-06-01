import Konva from 'konva'
import _ from 'lodash-es'
//
import { Render } from '../index'
import * as Types from '../types'
//
import * as Draws from '../draws'

interface SortItem {
  id?: number // 有 id 就是其他节点，否则就是 选择目标
  value: number // 左、垂直中、右的 x 坐标值; 上、水平中、下的 y 坐标值；
}

type SortItemPair = [SortItem, SortItem]

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
      line.remove()
    }
    this.alignLines = []
  }

  // 通过偏移量移动【目标节点】
  selectingNodesPositionByOffset(offset: Konva.Vector2d) {
    for (const node of this.render.selectionTool.selectingNodes) {
      const x = node.attrs.nodeMousedownPos.x + offset.x
      const y = node.attrs.nodeMousedownPos.y + offset.y
      node.x(x)
      node.y(y)
    }
  }

  // 重置【目标节点】的 nodeMousedownPos
  selectingNodesPositionReset() {
    for (const node of this.render.selectionTool.selectingNodes) {
      node.attrs.nodeMousedownPos.x = node.x()
      node.attrs.nodeMousedownPos.y = node.y()
    }
  }

  // 重置 transformer 状态
  transformerStateReset() {
    // 记录 transformer pos
    this.transformerMousedownPos = this.render.transformer.position()
  }

  // 重置
  reset() {
    // 对齐线清除
    this.alignLinesClear()

    this.transformerStateReset()
    this.selectingNodesPositionReset()
  }

  handlers = {
    // 选择相关
    stage: {
      mousedown: (e: Konva.KonvaEventObject<GlobalEventHandlersEventMap['mousedown']>) => {
        const parent = e.target.getParent()

        if (e.target === this.render.stage) {
          // 点击空白处

          // 清除选择
          this.render.selectionTool.selectingClear()

          // 选择框
          if (e.evt.button === Types.MouseButton.左键) {
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
          if (e.evt.button === Types.MouseButton.左键) {
            if (!this.render.ignore(parent) && !this.render.ignoreDraw(e.target)) {
              if (e.evt.ctrlKey) {
                // 新增多选
                this.render.selectionTool.select([
                  ...this.render.selectionTool.selectingNodes,
                  parent
                ])
              } else {
                // 单选
                this.render.selectionTool.select([parent])
              }
            }
          } else {
            this.render.selectionTool.selectingClear()
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
            return !this.render.ignore(node) && !this.render.ignoreLink(node)
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
          if (e.evt.ctrlKey) {
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
      transform: () => {
        // 更新连线
        this.render.draws[Draws.LinkDraw.name].draw()
        // 更新预览
        this.render.draws[Draws.PreviewDraw.name].draw()
      },
      transformend: () => {
        // 变换结束

        // 重置状态
        this.reset()

        // 更新历史
        this.render.updateHistory()
        // 更新连线
        this.render.draws[Draws.LinkDraw.name].draw()
        // 更新预览
        this.render.draws[Draws.PreviewDraw.name].draw()
      },
      //
      dragstart: () => {
        //
      },
      // 拖动
      dragmove: () => {
        const pos = this.render.transformer.position()
        const { pos: transformerPos, isAttract } = this.attract(pos)

        if (isAttract) {
          // 磁吸偏移
          this.selectingNodesPositionByOffset({
            x: this.render.toStageValue(transformerPos.x - this.transformerMousedownPos.x),
            y: this.render.toStageValue(transformerPos.y - this.transformerMousedownPos.y)
          })

          // 更新预览
          this.render.draws[Draws.PreviewDraw.name].draw()
        }

        // 更新连线
        this.render.draws[Draws.LinkDraw.name].draw()
        // 更新预览
        this.render.draws[Draws.PreviewDraw.name].draw()
      },
      dragend: () => {
        // 拖动结束

        // 重置状态
        this.reset()

        // 更新历史
        this.render.updateHistory()
        // 更新连线
        this.render.draws[Draws.LinkDraw.name].draw()
        // 更新预览
        this.render.draws[Draws.PreviewDraw.name].draw()
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

  // 磁吸逻辑
  attract = (newPos: Konva.Vector2d) => {
    // 对齐线清除
    this.alignLinesClear()

    // stage 状态
    const stageState = this.render.getStageState()

    const width = this.render.transformer.width()
    const height = this.render.transformer.height()

    let newPosX = newPos.x
    let newPosY = newPos.y

    let isAttract = false

    let pairX: SortItemPair | null = null
    let pairY: SortItemPair | null = null

    // 对齐线 磁吸逻辑
    if (this.render.config.attractNode) {
      // 横向所有需要判断对齐的 x 坐标
      const sortX: Array<SortItem> = []
      // 纵向向所有需要判断对齐的 y 坐标
      const sortY: Array<SortItem> = []

      // 选择目标所有的对齐 x
      sortX.push(
        {
          value: this.render.toStageValue(newPos.x - stageState.x) // 左
        },
        {
          value: this.render.toStageValue(newPos.x - stageState.x + width / 2) // 垂直中
        },
        {
          value: this.render.toStageValue(newPos.x - stageState.x + width) // 右
        }
      )

      // 选择目标所有的对齐 y
      sortY.push(
        {
          value: this.render.toStageValue(newPos.y - stageState.y) // 上
        },
        {
          value: this.render.toStageValue(newPos.y - stageState.y + height / 2) // 水平中
        },
        {
          value: this.render.toStageValue(newPos.y - stageState.y + height) // 下
        }
      )

      // 拖动目标
      const targetIds = this.render.selectionTool.selectingNodes.map((o) => o._id)
      // 除拖动目标的其他
      const otherNodes = this.render.layer.getChildren((node) => !targetIds.includes(node._id))

      // 其他节点所有的 x / y 坐标
      for (const node of otherNodes) {
        // x
        sortX.push(
          {
            id: node._id,
            value: node.x() // 左
          },
          {
            id: node._id,
            value: node.x() + node.width() / 2 // 垂直中
          },
          {
            id: node._id,
            value: node.x() + node.width() // 右
          }
        )
        // y
        sortY.push(
          {
            id: node._id,
            value: node.y() // 上
          },
          {
            id: node._id,
            value: node.y() + node.height() / 2 // 水平中
          },
          {
            id: node._id,
            value: node.y() + node.height() // 下
          }
        )
      }

      // 排序
      sortX.sort((a, b) => a.value - b.value)
      sortY.sort((a, b) => a.value - b.value)

      // x 最短距离
      let XMin = Infinity
      // x 最短距离的【对】（多个）
      let pairXMin: Array<SortItemPair> = []

      // y 最短距离
      let YMin = Infinity
      // y 最短距离的【对】（多个）
      let pairYMin: Array<SortItemPair> = []

      // 一对对比较距离，记录最短距离的【对】
      // 必须是 选择目标 与 其他节点 成【对】
      // 可能有多个这样的【对】

      for (let i = 0; i < sortX.length - 1; i++) {
        // 相邻两个点，必须为 目标节点 + 非目标节点
        if (
          (sortX[i].id === void 0 && sortX[i + 1].id !== void 0) ||
          (sortX[i].id !== void 0 && sortX[i + 1].id === void 0)
        ) {
          // 相邻两个点的 x 距离
          const offset = Math.abs(sortX[i].value - sortX[i + 1].value)
          if (offset < XMin) {
            // 更新 x 最短距离 记录
            XMin = offset
            // 更新 x 最短距离的【对】 记录
            pairXMin = [[sortX[i], sortX[i + 1]]]
          } else if (offset === XMin) {
            // 存在多个 x 最短距离
            pairXMin.push([sortX[i], sortX[i + 1]])
          }
        }
      }

      for (let i = 0; i < sortY.length - 1; i++) {
        // 相邻两个点，必须为 目标节点 + 非目标节点
        if (
          (sortY[i].id === void 0 && sortY[i + 1].id !== void 0) ||
          (sortY[i].id !== void 0 && sortY[i + 1].id === void 0)
        ) {
          // 相邻两个点的 y 距离
          const offset = Math.abs(sortY[i].value - sortY[i + 1].value)
          if (offset < YMin) {
            // 更新 y 最短距离 记录
            YMin = offset
            // 更新 y 最短距离的【对】 记录
            pairYMin = [[sortY[i], sortY[i + 1]]]
          } else if (offset === YMin) {
            // 存在多个 y 最短距离
            pairYMin.push([sortY[i], sortY[i + 1]])
          }
        }
      }

      // 取第一【对】，用于判断距离是否在阈值内

      if (pairXMin[0]) {
        if (Math.abs(pairXMin[0][0].value - pairXMin[0][1].value) < this.render.bgSize / 2) {
          pairX = pairXMin[0]
        }
      }

      if (pairYMin[0]) {
        if (Math.abs(pairYMin[0][0].value - pairYMin[0][1].value) < this.render.bgSize / 2) {
          pairY = pairYMin[0]
        }
      }

      // 优先对齐节点

      // 存在 1或多个 x 最短距离 满足阈值
      if (pairX?.length === 2) {
        for (const pair of pairXMin) {
          // 【对】里的那个非目标节点
          const other = pair.find((o) => o.id !== void 0)
          if (other) {
            // x 对齐线
            const line = new Konva.Line({
              points: _.flatten([
                [other.value, this.render.toStageValue(-stageState.y)],
                [other.value, this.render.toStageValue(this.render.stage.height() - stageState.y)]
              ]),
              stroke: 'blue',
              strokeWidth: this.render.toStageValue(1),
              dash: [4, 4],
              listening: false
            })
            this.alignLines.push(line)
            this.render.layerCover.add(line)
          }
        }
        // 磁贴第一个【对】
        const target = pairX.find((o) => o.id === void 0)
        const other = pairX.find((o) => o.id !== void 0)
        if (target && other) {
          // 磁铁坐标值
          newPosX = newPosX - this.render.toBoardValue(target.value - other.value)
          isAttract = true
        }
      }

      // 存在 1或多个 y 最短距离 满足阈值
      if (pairY?.length === 2) {
        for (const pair of pairYMin) {
          // 【对】里的那个非目标节点
          const other = pair.find((o) => o.id !== void 0)
          if (other) {
            // y 对齐线
            const line = new Konva.Line({
              points: _.flatten([
                [this.render.toStageValue(-stageState.x), other.value],
                [this.render.toStageValue(this.render.stage.width() - stageState.x), other.value]
              ]),
              stroke: 'blue',
              strokeWidth: this.render.toStageValue(1),
              dash: [4, 4],
              listening: false
            })
            this.alignLines.push(line)
            this.render.layerCover.add(line)
          }
        }
        // 磁贴第一个【对】
        const target = pairY.find((o) => o.id === void 0)
        const other = pairY.find((o) => o.id !== void 0)
        if (target && other) {
          // 磁铁坐标值
          newPosY = newPosY - this.render.toBoardValue(target.value - other.value)
          isAttract = true
        }
      }
    }

    if (this.render.config.attractBg) {
      // 没有 x 对齐节点
      if (pairX === null) {
        const logicLeftX = this.render.toStageValue(newPos.x - stageState.x) // x坐标
        const logicNumLeftX = Math.round(logicLeftX / this.render.bgSize) // x单元格个数
        const logicClosestLeftX = logicNumLeftX * this.render.bgSize // x磁贴目标坐标
        const logicDiffLeftX = Math.abs(logicLeftX - logicClosestLeftX) // x磁贴偏移量

        const logicRightX = this.render.toStageValue(newPos.x + width - stageState.x) // x坐标
        const logicNumRightX = Math.round(logicRightX / this.render.bgSize) // x单元格个数
        const logicClosestRightX = logicNumRightX * this.render.bgSize // x磁贴目标坐标
        const logicDiffRightX = Math.abs(logicRightX - logicClosestRightX) // x磁贴偏移量

        // stage 逻辑边界磁贴
        const logicStageRightX = stageState.width
        const logicDiffStageRightX = Math.abs(logicRightX - logicStageRightX)

        // 距离近优先
        for (const diff of [
          { type: 'leftX', value: logicDiffLeftX },
          { type: 'rightX', value: logicDiffRightX },
          { type: 'stageRightX', value: logicDiffStageRightX }
        ].sort((a, b) => a.value - b.value)) {
          if (diff.value < 5) {
            if (diff.type === 'stageRightX') {
              console.log(1, newPosX)
              newPosX = this.render.toBoardValue(logicStageRightX) + stageState.x - width
              console.log(2, newPosX)
            } else if (diff.type === 'leftX') {
              newPosX = this.render.toBoardValue(logicClosestLeftX) + stageState.x
            } else if (diff.type === 'rightX') {
              newPosX = this.render.toBoardValue(logicClosestRightX) + stageState.x - width
            }
            isAttract = true
            break
          }
        }
      }

      // 没有 y 对齐节点
      if (pairY === null) {
        const logicTopY = this.render.toStageValue(newPos.y - stageState.y) // y坐标
        const logicNumTopY = Math.round(logicTopY / this.render.bgSize) // y单元格个数
        const logicClosestTopY = logicNumTopY * this.render.bgSize // y磁贴目标坐标
        const logicDiffTopY = Math.abs(logicTopY - logicClosestTopY) // y磁贴偏移量

        const logicBottomY = this.render.toStageValue(newPos.y + height - stageState.y) // y坐标
        const logicNumBottomY = Math.round(logicBottomY / this.render.bgSize) // y单元格个数
        const logicClosestBottomY = logicNumBottomY * this.render.bgSize // y磁贴目标坐标
        const logicDiffBottomY = Math.abs(logicBottomY - logicClosestBottomY) // y磁贴偏移量

        // stage 逻辑边界磁贴
        const logicStageBottomY = stageState.height
        const logicDiffStageBottomY = Math.abs(logicBottomY - logicStageBottomY)

        // 距离近优先
        for (const diff of [
          { type: 'topY', value: logicDiffTopY },
          { type: 'bottomY', value: logicDiffBottomY },
          { type: 'stageBottomY', value: logicDiffStageBottomY }
        ].sort((a, b) => a.value - b.value)) {
          if (diff.value < 5) {
            if (diff.type === 'stageBottomY') {
              newPosY = this.render.toBoardValue(logicStageBottomY) + stageState.y - height
            } else if (diff.type === 'topY') {
              newPosY = this.render.toBoardValue(logicClosestTopY) + stageState.y
            } else if (diff.type === 'bottomY') {
              newPosY = this.render.toBoardValue(logicClosestBottomY) + stageState.y - height
            }
            isAttract = true
            break
          }
        }
      }
    }

    return {
      pos: {
        x: newPosX,
        y: newPosY
      },
      isAttract
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

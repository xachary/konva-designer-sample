import Konva from 'konva'
//
import { Render } from '../index'
import * as Types from '../types'

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
      transformend: () => {
        // 变换结束

        // 重置状态
        this.reset()
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
        }
      },
      dragend: () => {
        // 拖动结束

        // 重置状态
        this.reset()
      }
    }
  }

  // 吸附逻辑（左上角）
  attract = (newPos: Konva.Vector2d) => {
    // stage 状态
    const stageState = this.render.getStageState()

    const width = this.render.transformer.width()
    const height = this.render.transformer.height()

    let newPosX = newPos.x
    let newPosY = newPos.y

    let isAttract = false

    if (this.render.config.attractBg) {
      const logicLeftX = this.render.toStageValue(newPos.x - stageState.x) // x坐标
      const logicNumLeftX = Math.round(logicLeftX / this.render.bgSize) // x单元格个数
      const logicClosestLeftX = logicNumLeftX * this.render.bgSize // x磁贴目标坐标
      const logicDiffLeftX = Math.abs(logicLeftX - logicClosestLeftX) // x磁贴偏移量

      const logicRightX = this.render.toStageValue(newPos.x + width - stageState.x) // x坐标
      const logicNumRightX = Math.round(logicRightX / this.render.bgSize) // x单元格个数
      const logicClosestRightX = logicNumRightX * this.render.bgSize // x磁贴目标坐标
      const logicDiffRightX = Math.abs(logicRightX - logicClosestRightX) // x磁贴偏移量

      const logicTopY = this.render.toStageValue(newPos.y - stageState.y) // y坐标
      const logicNumTopY = Math.round(logicTopY / this.render.bgSize) // y单元格个数
      const logicClosestTopY = logicNumTopY * this.render.bgSize // y磁贴目标坐标
      const logicDiffTopY = Math.abs(logicTopY - logicClosestTopY) // y磁贴偏移量

      const logicBottomY = this.render.toStageValue(newPos.y + height - stageState.y) // y坐标
      const logicNumBottomY = Math.round(logicBottomY / this.render.bgSize) // y单元格个数
      const logicClosestBottomY = logicNumBottomY * this.render.bgSize // y磁贴目标坐标
      const logicDiffBottomY = Math.abs(logicBottomY - logicClosestBottomY) // y磁贴偏移量

      // 距离近优先

      for (const diff of [
        { type: 'leftX', value: logicDiffLeftX },
        { type: 'rightX', value: logicDiffRightX }
      ].sort((a, b) => a.value - b.value)) {
        if (diff.value > this.render.bgSize / 10 && diff.value < this.render.bgSize / 5) {
          if (diff.type === 'leftX') {
            newPosX = this.render.toBoardValue(logicClosestLeftX) + stageState.x
          } else if (diff.type === 'rightX') {
            newPosX = this.render.toBoardValue(logicClosestRightX) + stageState.x - width
          }
          isAttract = true
          break
        }
      }

      for (const diff of [
        { type: 'topY', value: logicDiffTopY },
        { type: 'bottomY', value: logicDiffBottomY }
      ].sort((a, b) => a.value - b.value)) {
        if (diff.value > this.render.bgSize / 10 && diff.value < this.render.bgSize / 5) {
          if (diff.type === 'topY') {
            newPosY = this.render.toBoardValue(logicClosestTopY) + stageState.y
          } else if (diff.type === 'bottomY') {
            newPosY = this.render.toBoardValue(logicClosestBottomY) + stageState.y - height
          }
          isAttract = true
          break
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
          const snappedX = /-(left|right)$/.test(anchor) && logicDiffX < this.render.bgSize / 5 // x磁贴阈值

          const logicY = this.render.toStageValue(newPos.y - stageState.y) // y坐标
          const logicNumY = Math.round(logicY / this.render.bgSize) // y单元格个数
          const logicClosestY = logicNumY * this.render.bgSize // y磁贴目标坐标
          const logicDiffY = Math.abs(logicY - logicClosestY) // y磁贴偏移量
          const snappedY = /^(top|bottom)-/.test(anchor) && logicDiffY < this.render.bgSize / 5 // y磁贴阈值

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

import Konva from 'konva'
import _ from 'lodash-es'
//
import { Render } from '../index'
//

interface SortItem {
  id?: number // 有 id 就是其他节点，否则就是 选择目标
  value: number // 左、垂直中、右的 x 坐标值; 上、水平中、下的 y 坐标值；
}

interface AlignRect {
  x: number
  y: number
  width: number
  height: number
}

type SortItemPair = [SortItem, SortItem]

export class AttractTool {
  static readonly name = 'AttractTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  // 对齐线
  alignLines: Konva.Line[] = []

  // 对齐线清除
  alignLinesClear() {
    for (const line of this.alignLines) {
      line.remove()
    }
    this.alignLines = []
  }

  getSortItems(rect: AlignRect) {
    // stage 状态
    const stageState = this.render.getStageState()

    // 横向所有需要判断对齐的 x 坐标
    const sortX: Array<SortItem> = []
    // 纵向向所有需要判断对齐的 y 坐标
    const sortY: Array<SortItem> = []

    // 选择目标所有的对齐 x
    sortX.push(
      {
        value: this.render.toStageValue(rect.x - stageState.x) // 左
      },
      {
        value: this.render.toStageValue(rect.x - stageState.x + rect.width / 2) // 垂直中
      },
      {
        value: this.render.toStageValue(rect.x - stageState.x + rect.width) // 右
      }
    )

    // 选择目标所有的对齐 y
    sortY.push(
      {
        value: this.render.toStageValue(rect.y - stageState.y) // 上
      },
      {
        value: this.render.toStageValue(rect.y - stageState.y + rect.height / 2) // 水平中
      },
      {
        value: this.render.toStageValue(rect.y - stageState.y + rect.height) // 下
      }
    )

    // 拖动目标
    const targetIds = this.render.selectionTool.selectingNodes.map((o) => o._id)
    // 除拖动目标的其他
    const otherNodes = this.render.layer
      .find('.asset')
      .filter((node) => !targetIds.includes(node._id))

    // 其他节点所有的 x / y 坐标
    for (const node of otherNodes) {
      const nodeRect = node.getClientRect()
      // x
      sortX.push(
        {
          id: node._id,
          value: this.render.toStageValue(nodeRect.x - stageState.x) // 左
        },
        {
          id: node._id,
          value: this.render.toStageValue(nodeRect.x - stageState.x + nodeRect.width / 2) // 垂直中
        },
        {
          id: node._id,
          value: this.render.toStageValue(nodeRect.x - stageState.x + nodeRect.width) // 右
        }
      )
      // y
      sortY.push(
        {
          id: node._id,
          value: this.render.toStageValue(nodeRect.y - stageState.y) // 上
        },
        {
          id: node._id,
          value: this.render.toStageValue(nodeRect.y - stageState.y + nodeRect.height / 2) // 水平中
        },
        {
          id: node._id,
          value: this.render.toStageValue(nodeRect.y - stageState.y + nodeRect.height) // 下
        }
      )
    }

    // 排序
    sortX.sort((a, b) => a.value - b.value)
    sortY.sort((a, b) => a.value - b.value)

    return { sortX, sortY }
  }

  // 磁吸逻辑
  attract = (rect: AlignRect) => {
    // 对齐线清除
    this.alignLinesClear()

    // stage 状态
    const stageState = this.render.getStageState()

    const width = this.render.transformer.width()
    const height = this.render.transformer.height()

    let newPosX = rect.x
    let newPosY = rect.y

    let isAttract = false

    let pairX: SortItemPair | null = null
    let pairY: SortItemPair | null = null

    // 对齐线 磁吸逻辑
    if (this.render.config.attractNode) {
      const { sortX, sortY } = this.getSortItems(rect)

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
        const logicLeftX = this.render.toStageValue(newPosX - stageState.x) // x坐标
        const logicNumLeftX = Math.round(logicLeftX / this.render.bgSize) // x单元格个数
        const logicClosestLeftX = logicNumLeftX * this.render.bgSize // x磁贴目标坐标
        const logicDiffLeftX = Math.abs(logicLeftX - logicClosestLeftX) // x磁贴偏移量

        const logicRightX = this.render.toStageValue(newPosX + width - stageState.x) // x坐标
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
        const logicTopY = this.render.toStageValue(newPosY - stageState.y) // y坐标
        const logicNumTopY = Math.round(logicTopY / this.render.bgSize) // y单元格个数
        const logicClosestTopY = logicNumTopY * this.render.bgSize // y磁贴目标坐标
        const logicDiffTopY = Math.abs(logicTopY - logicClosestTopY) // y磁贴偏移量

        const logicBottomY = this.render.toStageValue(newPosY + height - stageState.y) // y坐标
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
}

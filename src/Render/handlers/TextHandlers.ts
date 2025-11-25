import Konva from 'konva'
//
import { Render } from '../index'
import * as Types from '../types'

import { nanoid } from 'nanoid'

export class TextHandlers implements Types.Handler {
  static readonly name = 'Text'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  /**
   * 获取鼠标位置，并处理为 相对大小
   * @param attract 含磁贴计算
   * @returns
   */
  getStagePoint(attract = false) {
    const pos = this.render.stage.getPointerPosition()
    if (pos) {
      const stageState = this.render.getStageState()
      if (attract) {
        // 磁贴
        const { pos: transformerPos } = this.render.attractTool.attractPoint(pos)
        return {
          x: this.render.toStageValue(transformerPos.x - stageState.x),
          y: this.render.toStageValue(transformerPos.y - stageState.y)
        }
      } else {
        return {
          x: this.render.toStageValue(pos.x - stageState.x),
          y: this.render.toStageValue(pos.y - stageState.y)
        }
      }
    }
    return null
  }

  group: Konva.Group | null = null

  handlers = {
    stage: {
      mousedown: (e: Konva.KonvaEventObject<GlobalEventHandlersEventMap['mousedown']>) => {
        if (this.render.texting) {
          if (e.target === this.render.stage) {
            this.render.selectionTool.selectingClear()
            this.render.linkTool.selectingClear()

            const point = this.getStagePoint()
            if (point) {
              this.group = this.render.importExportTool.addTextAsset(point)
            }
          }
        }
      },
      mouseup: () => {
        if (this.group && this.render.texting) {
          this.render.selectionTool.select([this.group])
        }
        this.render.changeTexting(false)
      }
    },
    transformer: {
      dblclick: () => {
        // 界面上修改文字，涉及到状态控制较多，暂时在属性面板上设置
        // https://konvajs.org/docs/sandbox/Editable_Text.html
      }
    }
  }
}

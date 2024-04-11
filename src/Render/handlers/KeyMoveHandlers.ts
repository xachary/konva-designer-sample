import _ from 'lodash-es'
//
import { Render } from '../index'
import * as Types from '../types'

export class KeyMoveHandlers implements Types.Handler {
  static readonly name = 'KeyMove'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  speed = 1
  speedMax = 20

  handlers = {
    dom: {
      keydown: (e: GlobalEventHandlersEventMap['keydown']) => {
        if (!e.ctrlKey) {
          if (
            Object.values(Types.MoveKey)
              .map((o) => o.toString())
              .includes(e.code)
          ) {
            if (e.code === Types.MoveKey.上) {
              this.render.selectionTool.selectingNodesAreaMove({ x: 0, y: -this.speed })
              this.render.selectionTool.selectingNodesMove({ x: 0, y: -this.speed })
            } else if (e.code === Types.MoveKey.左) {
              this.render.selectionTool.selectingNodesAreaMove({ x: -this.speed, y: 0 })
              this.render.selectionTool.selectingNodesMove({ x: -this.speed, y: 0 })
            } else if (e.code === Types.MoveKey.右) {
              this.render.selectionTool.selectingNodesAreaMove({ x: this.speed, y: 0 })
              this.render.selectionTool.selectingNodesMove({ x: this.speed, y: 0 })
            } else if (e.code === Types.MoveKey.下) {
              this.render.selectionTool.selectingNodesAreaMove({ x: 0, y: this.speed })
              this.render.selectionTool.selectingNodesMove({ x: 0, y: this.speed })
            }

            if (this.speed < this.speedMax) {
              this.speed++
            }
          }
        }
      },
      keyup: () => {
        this.speed = 1
      }
    }
  }
}

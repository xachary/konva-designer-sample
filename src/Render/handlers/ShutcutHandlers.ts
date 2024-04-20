import { Render } from '../index'
import * as Types from '../types'

export class ShutcutHandlers implements Types.Handler {
  static readonly name = 'Shutcut'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  handlers = {
    dom: {
      keydown: (e: GlobalEventHandlersEventMap['keydown']) => {
        if (e.ctrlKey) {
          if (e.code === Types.ShutcutKey.C) {
            this.render.copyTool.pasteStart()
          } else if (e.code === Types.ShutcutKey.V) {
            this.render.copyTool.pasteEnd()
          }
        } else if (e.code === Types.ShutcutKey.删除) {
          this.render.remove(this.render.selectionTool.selectingNodes)
        }
      }
    }
  }
}

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
        if (!this.render.config.readonly) {
          if (e.ctrlKey || e.metaKey) {
            if (e.code === Types.ShutcutKey.C) {
              this.render.copyTool.pasteStart()
            } else if (e.code === Types.ShutcutKey.V) {
              this.render.copyTool.pasteEnd()
            } else if (e.code === Types.ShutcutKey.Z) {
              if (e.shiftKey) {
                this.render.nextHistory()
              } else {
                this.render.prevHistory()
              }
            } else if (e.code === Types.ShutcutKey.A) {
              this.render.selectionTool.selectAll()
            }
          } else if (e.code === Types.ShutcutKey.删除 || e.code === Types.ShutcutKey.Backspace) {
            this.render.remove(this.render.selectionTool.selectingNodes)
            // 删除 连接线
            this.render.linkTool.remove()
          } else if (e.code === Types.ShutcutKey.Esc) {
            this.render.selectionTool.selectingClear()
            this.render.linkTool.selectingClear()
          }
        }

        if (e.code === Types.ShutcutKey.R) {
          if (e.ctrlKey || e.metaKey) {
            window.location.reload()
          }
        }
      }
    }
  }
}

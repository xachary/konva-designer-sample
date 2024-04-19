import _ from 'lodash-es'
import Konva from 'konva'
import * as Types from '../types'

export interface ContextmenuDrawOption {
  ignore: (node: any) => boolean
}

export class ContextmenuDraw extends Types.BaseDraw implements Types.Draw {
  static override readonly name = 'contextmenu'

  option: ContextmenuDrawOption

  state: {
    target: Konva.Node | null
    mousedown: boolean
    trigger: boolean
    lastPos: Konva.Vector2d | null
    right: boolean
  }

  on: {
    positionZoomReset: () => void
    positionReset: () => void
    remove: (nodes: Konva.Node[]) => void
    copy: (nodes: Konva.Node[]) => Konva.Node[]
    top: (nodes: Konva.Node[]) => void
    up: (nodes: Konva.Node[]) => void
    down: (nodes: Konva.Node[]) => void
    bottom: (nodes: Konva.Node[]) => void
  } = {
    positionZoomReset: () => {},
    positionReset: () => {},
    remove: () => {},
    copy: () => [],
    top: () => {},
    up: () => {},
    down: () => {},
    bottom: () => {}
  }

  constructor(render: Types.Render, layer: Konva.Layer, option: ContextmenuDrawOption) {
    super(render, layer)

    this.option = option
    this.state = { target: null, mousedown: false, trigger: false, lastPos: null, right: false }
  }

  override draw() {
    this.clear()

    if (this.state.target) {
      // stage 状态
      const stageState = this.render.getStageState()

      const group = new Konva.Group({
        name: 'contextmenu',
        width: stageState.width,
        height: stageState.height,
      })

      const menus: Array<{
        name: string
        action: (e: Konva.KonvaEventObject<MouseEvent>) => void
      }> = []

      if (this.state.target === this.render.stage) {
        // 空白处
        menus.push({
          name: '恢复位置',
          action: () => {
            this.render.positionTool.positionReset()
          }
        })
        menus.push({
          name: '恢复大小位置',
          action: () => {
            this.render.positionTool.positionZoomReset()
          }
        })
      } else {
        const target = this.state.target.parent

        // 目标
        menus.push({
          name: '复制',
          action: () => {
            if (target) {
              this.render.copyTool.copy([target])
            }
          }
        })
        menus.push({
          name: '删除',
          action: () => {
            if (target) {
              this.render.remove([target])
            }
          }
        })
        menus.push({
          name: '置顶',
          action: () => {
            if (target) {
              this.render.zIndexTool.top([target])
            }
          }
        })
        menus.push({
          name: '上一层',
          action: () => {
            if (target) {
              this.render.zIndexTool.up([target])
            }
          }
        })
        menus.push({
          name: '下一层',
          action: () => {
            if (target) {
              this.render.zIndexTool.down([target])
            }
          }
        })
        menus.push({
          name: '置底',
          action: () => {
            if (target) {
              this.render.zIndexTool.bottom([target])
            }
          }
        })
      }

      let top = 0
      const lineHeight = 30
      const pos = this.render.stage.getPointerPosition()
      if (pos) {
        for (const menu of menus) {
          const rect = new Konva.Rect({
            x: this.render.toStageValue(pos.x - stageState.x),
            y: this.render.toStageValue(pos.y + top - stageState.y),
            width: this.render.toStageValue(100),
            height: this.render.toStageValue(lineHeight),
            fill: '#fff',
            stroke: '#999',
            strokeWidth: this.render.toStageValue(1),
            name: 'contextmenu'
          })
          const text = new Konva.Text({
            x: this.render.toStageValue(pos.x - stageState.x),
            y: this.render.toStageValue(pos.y + top - stageState.y),
            text: menu.name,
            name: 'contextmenu',
            listening: false,
            fontSize: this.render.toStageValue(16),
            fill: '#333',
            width: this.render.toStageValue(100),
            height: this.render.toStageValue(lineHeight),
            align: 'center',
            verticalAlign: 'middle'
          })
          group.add(rect)
          group.add(text)
          let mousedowning = false
          rect.on('click', (e) => {
            if (e.evt.button === Types.MouseButton.左键) {
              menu.action(e)

              // 重置
              this.group.removeChildren()
              this.state.target = null

              // this.state.trigger = false;
            }

            e.evt.preventDefault()
            e.evt.stopPropagation()
          })
          rect.on('mousedown', (e) => {
            if (e.evt.button === Types.MouseButton.左键) {
              mousedowning = true
              this.state.mousedown = true
              rect.fill('#dfdfdf')
            }

            e.evt.preventDefault()
            e.evt.stopPropagation()
          })
          rect.on('mouseup', (e) => {
            if (e.evt.button === Types.MouseButton.左键) {
              mousedowning = false
              this.state.mousedown = false
            }
          })
          rect.on('mouseenter', (e) => {
            if (mousedowning) {
              rect.fill('#dfdfdf')
            } else {
              rect.fill('#efefef')
            }

            // this.state.trigger = true;

            e.evt.preventDefault()
            e.evt.stopPropagation()
          })
          rect.on('mouseout', () => {
            rect.fill('#fff')
            // this.state.trigger = false;
          })
          rect.on('contextmenu', (e) => {
            e.evt.preventDefault()
            e.evt.stopPropagation()
          })

          top += lineHeight - 1
        }
      }

      // this.state.trigger = false;

      this.group.add(group)
    }
  }

  // eslint-disable-next-line
  handlers = {
    stage: {
      mousedown: (e: Konva.KonvaEventObject<GlobalEventHandlersEventMap['mousedown']>) => {
        this.state.lastPos = this.render.stage.getPointerPosition()
        if (e.evt.button === Types.MouseButton.左键) {
          if (!this.state.mousedown) {
            this.state.target = null
            this.draw()
          }
        } else if (e.evt.button === Types.MouseButton.右键) {
          this.state.right = true
        }
      },
      mousemove: () => {
        if (this.state.target && this.state.right) {
          this.state.target = null
          this.draw()
        }
      },
      mouseup: () => {
        this.state.right = false
      },
      contextmenu: (e: Konva.KonvaEventObject<GlobalEventHandlersEventMap['contextmenu']>) => {
        const pos = this.render.stage.getPointerPosition()
        if (pos && this.state.lastPos) {
          if (!this.state.trigger) {
            if (pos.x === this.state.lastPos.x || pos.y === this.state.lastPos.y) {
              this.state.target = e.target
            } else {
              this.state.target = null
            }
            this.draw()
          }
        }
      },
      wheel: () => {
        this.state.target = null
        this.draw()
      }
    }
  }
}

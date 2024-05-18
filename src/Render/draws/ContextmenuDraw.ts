import Konva from 'konva'
import * as Types from '../types'

export interface ContextmenuDrawOption {
  //
}

export class ContextmenuDraw extends Types.BaseDraw implements Types.Draw {
  static override readonly name = 'contextmenu'

  option: ContextmenuDrawOption

  state: {
    target: Konva.Node | null // 右键目标节点（或空白处）
    menuIsMousedown: boolean // 菜单被鼠标按下状态
    lastPos: Konva.Vector2d | null // 记录鼠标按下位置（用于判断按下和释放的时候是不是同一位置）
    right: boolean // 鼠标按下的是否是右键
  }

  constructor(render: Types.Render, layer: Konva.Layer, option: ContextmenuDrawOption) {
    super(render, layer)

    this.option = option
    this.state = { target: null, menuIsMousedown: false, lastPos: null, right: false }
  }

  override draw() {
    this.clear()

    if (this.state.target) {
      // 菜单数组
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
        // 未选择：真实节点，即素材的容器 group
        // 已选择：transformer
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
          name: '上移',
          action: () => {
            if (target) {
              this.render.zIndexTool.up([target])
            }
          }
        })
        menus.push({
          name: '下移',
          action: () => {
            if (target) {
              this.render.zIndexTool.down([target])
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
          name: '置底',
          action: () => {
            if (target) {
              this.render.zIndexTool.bottom([target])
            }
          }
        })
        if (target instanceof Konva.Transformer) {
          const pos = this.render.stage.getPointerPosition()

          if (pos) {
            // 获取所有图形
            const shapes = target.nodes()
            if (shapes.length > 1) {
              // zIndex 倒序（大的优先）
              shapes.sort((a, b) => b.zIndex() - a.zIndex())

              // 提取重叠目标
              const selected = shapes.find((shape) =>
                // 关键 api
                Konva.Util.haveIntersection({ ...pos, width: 1, height: 1 }, shape.getClientRect())
              )

              // 对齐菜单
              menus.push({
                name: '垂直居中' + (selected ? '于目标' : ''),
                action: () => {
                  this.render.alignTool.align(Types.AlignType.垂直居中, selected)
                }
              })
              menus.push({
                name: '左对齐' + (selected ? '于目标' : ''),
                action: () => {
                  this.render.alignTool.align(Types.AlignType.左对齐, selected)
                }
              })
              menus.push({
                name: '右对齐' + (selected ? '于目标' : ''),
                action: () => {
                  this.render.alignTool.align(Types.AlignType.右对齐, selected)
                }
              })
              menus.push({
                name: '水平居中' + (selected ? '于目标' : ''),
                action: () => {
                  this.render.alignTool.align(Types.AlignType.水平居中, selected)
                }
              })
              menus.push({
                name: '上对齐' + (selected ? '于目标' : ''),
                action: () => {
                  this.render.alignTool.align(Types.AlignType.上对齐, selected)
                }
              })
              menus.push({
                name: '下对齐' + (selected ? '于目标' : ''),
                action: () => {
                  this.render.alignTool.align(Types.AlignType.下对齐, selected)
                }
              })
            }
          }
        }
      }

      // stage 状态
      const stageState = this.render.getStageState()

      // 绘制右键菜单
      const group = new Konva.Group({
        name: 'contextmenu',
        width: stageState.width,
        height: stageState.height
      })

      let top = 0
      // 菜单每项高度
      const lineHeight = 30

      const pos = this.render.stage.getPointerPosition()
      if (pos) {
        for (const menu of menus) {
          // 框
          const rect = new Konva.Rect({
            x: this.render.toStageValue(pos.x - stageState.x),
            y: this.render.toStageValue(pos.y + top - stageState.y),
            width: this.render.toStageValue(150),
            height: this.render.toStageValue(lineHeight),
            fill: '#fff',
            stroke: '#999',
            strokeWidth: this.render.toStageValue(1),
            name: 'contextmenu'
          })
          // 标题
          const text = new Konva.Text({
            x: this.render.toStageValue(pos.x - stageState.x),
            y: this.render.toStageValue(pos.y + top - stageState.y),
            text: menu.name,
            name: 'contextmenu',
            listening: false,
            fontSize: this.render.toStageValue(16),
            fill: '#333',
            width: this.render.toStageValue(150),
            height: this.render.toStageValue(lineHeight),
            align: 'center',
            verticalAlign: 'middle'
          })
          group.add(rect)
          group.add(text)

          // 菜单事件
          rect.on('click', (e) => {
            if (e.evt.button === Types.MouseButton.左键) {
              // 触发事件
              menu.action(e)

              // 移除菜单
              this.group.removeChildren()
              this.state.target = null
            }

            e.evt.preventDefault()
            e.evt.stopPropagation()
          })
          rect.on('mousedown', (e) => {
            if (e.evt.button === Types.MouseButton.左键) {
              this.state.menuIsMousedown = true
              // 按下效果
              rect.fill('#dfdfdf')
            }

            e.evt.preventDefault()
            e.evt.stopPropagation()
          })
          rect.on('mouseup', (e) => {
            if (e.evt.button === Types.MouseButton.左键) {
              this.state.menuIsMousedown = false
            }
          })
          rect.on('mouseenter', (e) => {
            if (this.state.menuIsMousedown) {
              rect.fill('#dfdfdf')
            } else {
              // hover in
              rect.fill('#efefef')
            }

            e.evt.preventDefault()
            e.evt.stopPropagation()
          })
          rect.on('mouseout', () => {
            // hover out
            rect.fill('#fff')
          })
          rect.on('contextmenu', (e) => {
            e.evt.preventDefault()
            e.evt.stopPropagation()
          })

          top += lineHeight - 1
        }
      }

      this.group.add(group)
    }
  }

  handlers = {
    stage: {
      mousedown: (e: Konva.KonvaEventObject<GlobalEventHandlersEventMap['mousedown']>) => {
        this.state.lastPos = this.render.stage.getPointerPosition()

        if (e.evt.button === Types.MouseButton.左键) {
          if (!this.state.menuIsMousedown) {
            // 没有按下菜单，清除菜单
            this.state.target = null
            this.draw()
          }
        } else if (e.evt.button === Types.MouseButton.右键) {
          // 右键按下
          this.state.right = true
        }
      },
      mousemove: () => {
        if (this.state.target && this.state.right) {
          // 拖动画布时（右键），清除菜单
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
          // 右键目标
          if (pos.x === this.state.lastPos.x || pos.y === this.state.lastPos.y) {
            this.state.target = e.target
          } else {
            this.state.target = null
          }
          this.draw()
        }
      },
      wheel: () => {
        // 画布缩放时，清除菜单
        this.state.target = null
        this.draw()
      }
    }
  }
}

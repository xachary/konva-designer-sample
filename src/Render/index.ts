import Konva from 'konva'
//
import * as Types from './types'
//
import * as Draws from './draws'
import * as Handlers from './handlers'

// 渲染器
export class Render {
  stage: Konva.Stage

  // 主要层
  layer: Konva.Layer = new Konva.Layer({ id: 'main' })
  // 辅助层 - 底层
  layerFloor: Konva.Layer = new Konva.Layer()
  // 辅助层 - 顶层
  layerCover: Konva.Layer = new Konva.Layer()

  // 配置
  config: Types.RenderConfig

  // 附加工具
  draws: { [index: string]: Types.Draw & Types.Handler } = {}

  // 事件处理
  handlers: { [index: string]: Types.Handler } = {}

  // 参数
  bgSize = 20
  rulerSize = 40

  constructor(stageEle: HTMLDivElement, config: Types.RenderConfig) {
    this.config = config

    this.stage = new Konva.Stage({
      container: stageEle,
      x: this.rulerSize,
      y: this.rulerSize,
      width: config.width,
      height: config.height
    })

    // 附加工具
    this.draws[Draws.BgDraw.name] = new Draws.BgDraw(this.stage, this.config, this.layerFloor, {
      size: this.bgSize
    })
    this.draws[Draws.RulerDraw.name] = new Draws.RulerDraw(
      this.stage,
      this.config,
      this.layerCover,
      {
        size: this.rulerSize
      }
    )

    // 事件处理
    this.handlers[Handlers.DragHandlers.name] = new Handlers.DragHandlers(this)
    this.handlers[Handlers.ZoomHandlers.name] = new Handlers.ZoomHandlers(this)

    // 初始化
    this.init()
  }

  // 初始化
  init() {
    this.stage.add(this.layerFloor)
    this.draws[Draws.BgDraw.name].init()

    this.stage.add(this.layer)

    this.stage.add(this.layerCover)
    this.draws[Draws.RulerDraw.name].init()

    // 事件绑定
    this.eventBind()
  }

  // 更新 stage 尺寸
  resize(width: number, height: number) {
    this.stage.setAttrs({
      width: width,
      height: height
    })

    // 更新背景
    this.draws[Draws.BgDraw.name].draw()
    // 更新比例尺
    this.draws[Draws.RulerDraw.name].draw()
  }

  // 事件绑定
  eventBind() {
    for (const event of ['mousedown', 'mouseup', 'mousemove', 'wheel', 'contextmenu']) {
      this.stage.on(event, (e) => {
        e?.evt?.preventDefault()

        for (const k in this.draws) {
          this.draws[k].handlers?.stage?.[event]?.(e)
        }

        for (const k in this.handlers) {
          this.handlers[k].handlers?.stage?.[event]?.(e)
        }
      })
    }

    const container = this.stage.container()
    container.tabIndex = 1
    container.focus()
    for (const event of ['mouseenter', 'dragenter']) {
      container.addEventListener(event, (e) => {
        e?.preventDefault()

        if (['mouseenter', 'dragenter'].includes(event)) {
          // 激活 dom 事件
          this.stage.container().focus()
        }

        for (const k in this.draws) {
          this.draws[k].handlers?.dom?.[event]?.(e)
        }

        for (const k in this.handlers) {
          this.handlers[k].handlers?.dom?.[event]?.(e)
        }
      })
    }
  }
}

import _ from 'lodash-es'
//
import Konva from 'konva'
//
import * as Types from './types'
//
import * as Draws from './draws'
import * as Handlers from './handlers'
import * as Tools from './tools'

// 渲染器
export class Render {
  stage: Konva.Stage

  // 主要层
  layer: Konva.Layer = new Konva.Layer({ id: 'main' })
  // 辅助层 - 底层
  layerFloor: Konva.Layer = new Konva.Layer()
  // 辅助层 - 顶层
  layerCover: Konva.Layer = new Konva.Layer({ id: 'cover' })

  // 配置
  config: Types.RenderConfig

  // 附加工具
  draws: { [index: string]: Types.Draw & Types.Handler } = {}

  // 素材工具
  assetTool: Tools.AssetTool

  // 选择工具
  selectionTool: Tools.SelectionTool

  // 复制工具
  copyTool: Tools.CopyTool

  // 定位工具
  positionTool: Tools.PositionTool

  // 层级工具
  zIndexTool: Tools.ZIndexTool

  // 导入导出
  importExportTool: Tools.ImportExportTool

  // 对齐工具
  alignTool: Tools.AlignTool

  // 连线工具
  linkTool: Tools.LinkTool

  // 磁贴工具
  attractTool: Tools.AttractTool

  // 多选器层
  groupTransformer: Konva.Group = new Konva.Group()

  // 多选器
  transformer: Konva.Transformer = new Konva.Transformer({
    shouldOverdrawWholeArea: true,
    borderDash: [4, 4],
    padding: 1,
    rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315, 360]
  })

  // 选择框
  selectRect: Konva.Rect = new Konva.Rect({
    id: 'selectRect',
    fill: 'rgba(0,0,255,0.1)',
    visible: false
  })

  // 事件处理
  handlers: { [index: string]: Types.Handler } = {}

  // 参数
  bgSize = 20
  rulerSize = 0
  previewSize = 0.2 // 预览框大小（比例）
  pointSize = 6

  history: string[] = []
  historyIndex = -1

  // 调试模式
  debug = false

  changeDebug(v: boolean) {
    this.debug = v
    this.config.on?.debugChange?.(this.debug)

    this.draws[Draws.LinkDraw.name].init()
    this.draws[Draws.AttractDraw.name].init()
    this.draws[Draws.RulerDraw.name].init()
    this.draws[Draws.RefLineDraw.name].init()
    this.draws[Draws.ContextmenuDraw.name].init()
    this.draws[Draws.PreviewDraw.name].init()

    return this.debug
  }

  constructor(stageEle: HTMLDivElement, config: Types.RenderConfig) {
    this.config = config

    if (this.config.showRuler) {
      this.rulerSize = 40
    }

    this.stage = new Konva.Stage({
      container: stageEle,
      x: this.rulerSize,
      y: this.rulerSize,
      width: config.width,
      height: config.height
    })

    // 辅助层 - 顶层
    this.groupTransformer.add(this.transformer)
    this.groupTransformer.add(this.selectRect)
    this.layerCover.add(this.groupTransformer)

    // 附加工具
    this.draws[Draws.BgDraw.name] = new Draws.BgDraw(this, this.layerFloor, {
      size: this.bgSize
    })
    this.draws[Draws.LinkDraw.name] = new Draws.LinkDraw(this, this.layerCover, {
      size: this.pointSize
    })
    this.draws[Draws.AttractDraw.name] = new Draws.AttractDraw(this, this.layerCover, {
      size: this.pointSize
    })
    this.draws[Draws.RulerDraw.name] = new Draws.RulerDraw(this, this.layerCover, {
      size: this.rulerSize
    })
    this.draws[Draws.RefLineDraw.name] = new Draws.RefLineDraw(this, this.layerCover, {
      padding: this.rulerSize
    })
    this.draws[Draws.ContextmenuDraw.name] = new Draws.ContextmenuDraw(this, this.layerCover, {
      //
    })
    this.draws[Draws.PreviewDraw.name] = new Draws.PreviewDraw(this, this.layerCover, {
      size: this.previewSize
    })

    // 素材工具
    this.assetTool = new Tools.AssetTool(this)

    // 选择工具
    this.selectionTool = new Tools.SelectionTool(this)

    // 复制工具
    this.copyTool = new Tools.CopyTool(this)

    // 定位工具
    this.positionTool = new Tools.PositionTool(this)

    // 定位工具
    this.zIndexTool = new Tools.ZIndexTool(this)

    // 导入导出
    this.importExportTool = new Tools.ImportExportTool(this)

    // 对齐工具
    this.alignTool = new Tools.AlignTool(this)

    // 对齐工具
    this.linkTool = new Tools.LinkTool(this)

    // 磁贴工具
    this.attractTool = new Tools.AttractTool(this)

    // 事件处理
    this.handlers[Handlers.DragHandlers.name] = new Handlers.DragHandlers(this)
    this.handlers[Handlers.ZoomHandlers.name] = new Handlers.ZoomHandlers(this)
    this.handlers[Handlers.DragOutsideHandlers.name] = new Handlers.DragOutsideHandlers(this)
    this.handlers[Draws.RefLineDraw.name] = this.draws[Draws.RefLineDraw.name]
    this.handlers[Handlers.SelectionHandlers.name] = new Handlers.SelectionHandlers(this)
    this.handlers[Handlers.KeyMoveHandlers.name] = new Handlers.KeyMoveHandlers(this)
    this.handlers[Handlers.ShutcutHandlers.name] = new Handlers.ShutcutHandlers(this)
    this.handlers[Handlers.LinkHandlers.name] = new Handlers.LinkHandlers(this)

    // 初始化
    this.init()
  }

  // 初始化
  init() {
    this.stage.add(this.layerFloor)
    this.draws[Draws.BgDraw.name].init()

    this.stage.add(this.layer)

    this.stage.add(this.layerCover)
    this.draws[Draws.LinkDraw.name].init()
    this.draws[Draws.AttractDraw.name].init()
    this.draws[Draws.RulerDraw.name].init()
    this.draws[Draws.RefLineDraw.name].init()
    this.draws[Draws.ContextmenuDraw.name].init()
    this.draws[Draws.PreviewDraw.name].init()

    // 事件绑定
    this.eventBind()

    // 更新历史
    this.updateHistory()
  }

  // 更新 stage 尺寸
  resize(width: number, height: number) {
    this.stage.setAttrs({
      width: width,
      height: height
    })

    // 重绘
    this.redraw()
  }

  // 移除元素
  remove(nodes: Konva.Node[]) {
    for (const node of nodes) {
      if (node instanceof Konva.Transformer) {
        // 移除已选择的节点
        this.remove(this.selectionTool.selectingNodes)
      } else {
        // 移除未选择的节点
        node.destroy()
      }
    }

    if (nodes.length > 0) {
      // 清除选择
      this.selectionTool.selectingClear()

      // 更新历史
      this.updateHistory()

      // 重绘
      this.redraw()
    }
  }

  prevHistory() {
    const record = this.history[this.historyIndex - 1]
    if (record) {
      this.importExportTool.restore(record, true)
      this.historyIndex--
      // 历史变化事件
      this.config.on?.historyChange?.(_.clone(this.history), this.historyIndex)
    }
  }

  nextHistory() {
    const record = this.history[this.historyIndex + 1]
    if (record) {
      this.importExportTool.restore(record, true)
      this.historyIndex++
      // 历史变化事件
      this.config.on?.historyChange?.(_.clone(this.history), this.historyIndex)
    }
  }

  updateHistory() {
    this.history.splice(this.historyIndex + 1)
    this.history.push(this.importExportTool.save())
    this.historyIndex = this.history.length - 1
    // 历史变化事件
    this.config.on?.historyChange?.(_.clone(this.history), this.historyIndex)
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
    for (const event of [
      'mouseenter',
      'dragenter',
      'mousemove',
      'mouseout',
      'dragenter',
      'dragover',
      'drop',
      'keydown',
      'keyup'
    ]) {
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

    for (const event of [
      'mousedown',
      'transform',
      'transformend',
      'dragstart',
      'dragmove',
      'dragend',
      'mousemove',
      'mouseleave'
    ]) {
      this.transformer.on(event, (e) => {
        e?.evt?.preventDefault()

        for (const k in this.draws) {
          this.draws[k].handlers?.transformer?.[event]?.(e)
        }

        for (const k in this.handlers) {
          this.handlers[k].handlers?.transformer?.[event]?.(e)
        }
      })
    }

    this.handlers[Handlers.SelectionHandlers.name]?.transformerConfig?.anchorDragBoundFunc &&
      this.transformer.anchorDragBoundFunc(
        this.handlers[Handlers.SelectionHandlers.name].transformerConfig!.anchorDragBoundFunc!
      )
  }

  // 获取 stage 状态
  getStageState() {
    return {
      width: this.stage.width() - this.rulerSize,
      height: this.stage.height() - this.rulerSize,
      scale: this.stage.scaleX(),
      x: this.stage.x(),
      y: this.stage.y()
    }
  }

  // 相对大小（基于 stage，且无视 scale）
  toStageValue(boardPos: number) {
    return boardPos / this.stage.scaleX()
  }

  // 绝对大小（基于可视区域像素）
  toBoardValue(stagePos: number) {
    return stagePos * this.stage.scaleX()
  }

  // 忽略非素材
  ignore(node: Konva.Node) {
    // 素材有各自根 group
    const isGroup = node instanceof Konva.Group
    return (
      !isGroup ||
      node.id() === 'selectRect' ||
      node.id() === 'hoverRect' ||
      this.ignoreDraw(node) ||
      this.ignoreLink(node)
    )
  }

  // 忽略各 draw 的根 group
  ignoreDraw(node: Konva.Node) {
    return (
      node.name() === Draws.BgDraw.name ||
      node.name() === Draws.RulerDraw.name ||
      node.name() === Draws.RefLineDraw.name ||
      node.name() === Draws.ContextmenuDraw.name ||
      node.name() === Draws.PreviewDraw.name ||
      node.name() === Draws.LinkDraw.name ||
      node.name() === Draws.AttractDraw.name
    )
  }

  // 忽略各 draw 的根 group
  ignoreLink(node: Konva.Node) {
    return (
      node.name() === 'link-anchor' ||
      node.name() === 'linking-line' ||
      node.name() === 'link-point' ||
      node.name() === 'link-line'
    )
  }

  // 重绘（保留部分单独控制 draw）
  redraw() {
    // 更新背景
    this.draws[Draws.BgDraw.name].draw()
    // 更新连线
    this.draws[Draws.LinkDraw.name].draw()
    // 更新磁贴
    this.draws[Draws.AttractDraw.name].draw()
    // 更新比例尺
    this.draws[Draws.RulerDraw.name].draw()
    // 更新参考线
    this.draws[Draws.RefLineDraw.name].draw()
    // 更新预览
    this.draws[Draws.PreviewDraw.name].draw()
    // 更新右键菜单
    this.draws[Draws.ContextmenuDraw.name].draw()
  }
}

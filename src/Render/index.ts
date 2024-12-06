import _ from 'lodash-es'
import mitt, { type Emitter } from 'mitt'
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
  // 辅助层 - 背景
  layerFloor: Konva.Layer = new Konva.Layer()
  // 辅助层 - 连接线、对齐线
  layerCover: Konva.Layer = new Konva.Layer({ id: 'cover' })

  // 配置
  config: Types.RenderConfig

  // 附加工具
  draws: { [index: string]: (Types.Draw & Types.Handler) | undefined } = {}

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
    rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315, 360],
    flipEnabled: false
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

  // 画图类型
  graphType: Types.GraphType | undefined = undefined

  // 添加文字中
  texting = false

  protected emitter: Emitter<Types.RenderEvents> = mitt()
  on: Emitter<Types.RenderEvents>['on']
  off: Emitter<Types.RenderEvents>['off']
  emit: Emitter<Types.RenderEvents>['emit']

  changeDebug(v: boolean) {
    this.debug = v
    this.emit('debug-change', this.debug)

    this.draws[Draws.LinkDraw.name]?.init()
    this.draws[Draws.AttractDraw.name]?.init()
    this.draws[Draws.RulerDraw.name]?.init()
    this.draws[Draws.RefLineDraw.name]?.init()
    this.draws[Draws.ContextmenuDraw.name]?.init()
    this.draws[Draws.PreviewDraw.name]?.init()

    return this.debug
  }

  constructor(stageEle: HTMLDivElement, config: Types.RenderConfig) {
    this.config = config

    this.on = this.emitter.on.bind(this.emitter)
    this.off = this.emitter.off.bind(this.emitter)
    this.emit = this.emitter.emit.bind(this.emitter)

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
    if (!this.config.readonly && this.config.showBg) {
      this.draws[Draws.BgDraw.name] = new Draws.BgDraw(this, this.layerFloor, {
        size: this.bgSize
      })
    }

    this.draws[Draws.LinkDraw.name] = new Draws.LinkDraw(this, this.layerCover, {
      size: this.pointSize
    })
    this.draws[Draws.AttractDraw.name] = new Draws.AttractDraw(this, this.layerCover, {
      size: this.pointSize
    })

    if (!this.config.readonly && this.config.showRuler) {
      this.draws[Draws.RulerDraw.name] = new Draws.RulerDraw(this, this.layerCover, {
        size: this.rulerSize
      })
    }

    if (!this.config.readonly && this.config.showRefLine) {
      this.draws[Draws.RefLineDraw.name] = new Draws.RefLineDraw(this, this.layerCover, {
        padding: this.rulerSize
      })
    }

    if (this.config.showContextmenu) {
      this.draws[Draws.ContextmenuDraw.name] = new Draws.ContextmenuDraw(this, this.layerCover, {
        //
      })
    }

    if (!this.config.readonly && this.config.showPreview) {
      this.draws[Draws.PreviewDraw.name] = new Draws.PreviewDraw(this, this.layerCover, {
        size: this.previewSize
      })
    }

    this.draws[Draws.GraphDraw.name] = new Draws.GraphDraw(this, this.layerCover, {
      //
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

    if (!this.config.readonly) {
      this.handlers[Handlers.DragOutsideHandlers.name] = new Handlers.DragOutsideHandlers(this)
      this.handlers[Handlers.SelectionHandlers.name] = new Handlers.SelectionHandlers(this)
      this.handlers[Handlers.KeyMoveHandlers.name] = new Handlers.KeyMoveHandlers(this)
      this.handlers[Handlers.LinkHandlers.name] = new Handlers.LinkHandlers(this)
      this.handlers[Handlers.GraphHandlers.name] = new Handlers.GraphHandlers(this)
      this.handlers[Handlers.TextHandlers.name] = new Handlers.TextHandlers(this)
    }

    if (!this.config.readonly && this.config.showRefLine) {
      if (this.draws[Draws.RefLineDraw.name] !== void 0) {
        this.handlers[Draws.RefLineDraw.name] = this.draws[Draws.RefLineDraw.name]!
      }
    }

    this.handlers[Handlers.ShutcutHandlers.name] = new Handlers.ShutcutHandlers(this)

    // 初始化
    this.init()
  }

  // 初始化
  init() {
    this.stage.add(this.layerFloor)
    this.draws[Draws.BgDraw.name]?.init()

    this.stage.add(this.layer)

    this.stage.add(this.layerCover)
    this.draws[Draws.LinkDraw.name]?.init()
    this.draws[Draws.AttractDraw.name]?.init()
    this.draws[Draws.RulerDraw.name]?.init()
    this.draws[Draws.RefLineDraw.name]?.init()
    this.draws[Draws.ContextmenuDraw.name]?.init()
    this.draws[Draws.PreviewDraw.name]?.init()

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
        // 移除相关联系线信息
        const groupId = node.id()

        for (const rn of this.layer.getChildren()) {
          if (rn.id() !== groupId && Array.isArray(rn.attrs.points)) {
            for (const point of rn.attrs.points) {
              if (Array.isArray(point.pairs)) {
                // 移除拐点记录
                if (rn.attrs.manualPointsMap) {
                  point.pairs
                    .filter(
                      (pair: Types.LinkDrawPair) =>
                        pair.from.groupId === groupId || pair.to.groupId === groupId
                    )
                    .forEach((pair: Types.LinkDrawPair) => {
                      rn.attrs.manualPointsMap[pair.id] = undefined
                    })
                }

                // 连接线信息
                point.pairs = point.pairs.filter(
                  (pair: Types.LinkDrawPair) =>
                    pair.from.groupId !== groupId && pair.to.groupId !== groupId
                )
              }
            }

            rn.setAttr('points', rn.attrs.points)
          }
        }

        // 移除未选择的节点
        node.destroy()
      }
    }

    if (nodes.length > 0) {
      // 清除选择
      this.selectionTool.selectingClear()
      this.linkTool.selectingClear()

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
      this.emit('history-change', {
        records: _.clone(this.history),
        index: this.historyIndex
      })
    }
  }

  nextHistory() {
    const record = this.history[this.historyIndex + 1]
    if (record) {
      this.importExportTool.restore(record, true)
      this.historyIndex++
      // 历史变化事件
      this.emit('history-change', {
        records: _.clone(this.history),
        index: this.historyIndex
      })
    }
  }

  updateHistory() {
    this.history.splice(this.historyIndex + 1)
    this.history.push(this.importExportTool.save())
    this.historyIndex = this.history.length - 1
    // 历史变化事件
    this.emit('history-change', {
      records: _.clone(this.history),
      index: this.historyIndex
    })
  }

  // 事件绑定
  eventBind() {
    for (const event of [
      'mousedown',
      'mouseup',
      'mousemove',
      'wheel',
      'contextmenu',
      'pointerclick'
    ]) {
      this.stage.on(event, (e) => {
        e?.evt?.preventDefault()

        for (const k in this.draws) {
          this.draws[k]?.handlers?.stage?.[event]?.(e)
        }

        for (const k in this.handlers) {
          this.handlers[k]?.handlers?.stage?.[event]?.(e)
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
          this.draws[k]?.handlers?.dom?.[event]?.(e)
        }

        for (const k in this.handlers) {
          this.handlers[k]?.handlers?.dom?.[event]?.(e)
        }
      })
    }

    for (const event of [
      'mousedown',
      'transformstart',
      'transform',
      'transformend',
      'dragstart',
      'dragmove',
      'dragend',
      'mousemove',
      'mouseleave',
      'dblclick'
    ]) {
      this.transformer.on(event, (e) => {
        e?.evt?.preventDefault()

        for (const k in this.draws) {
          this.draws[k]?.handlers?.transformer?.[event]?.(e)
        }

        for (const k in this.handlers) {
          this.handlers[k]?.handlers?.transformer?.[event]?.(e)
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
    return !isGroup || this.ignoreSelect(node) || this.ignoreDraw(node) || this.ignoreLink(node)
  }

  // 忽略 选择时 辅助元素
  ignoreSelect(node: Konva.Node) {
    return node.id() === 'selectRect' || node.id() === 'hoverRect'
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
      node.name() === Draws.AttractDraw.name ||
      node.name() === Draws.GraphDraw.name
    )
  }

  // 忽略各 draw 的根 group
  ignoreLink(node: Konva.Node) {
    return (
      node.name() === 'link-anchor' ||
      node.name() === 'linking-line' ||
      node.name() === 'link-point' ||
      node.name() === 'link-line' ||
      node.name() === 'link-manual-point'
    )
  }

  // 重绘（可选择）
  redraw(drawNames?: string[]) {
    const all = [
      // layerFloor
      Draws.BgDraw.name, // 更新背景
      // layerCover（按先后顺序）
      Draws.GraphDraw.name, // 更新图形调整点
      Draws.LinkDraw.name, // 更新连线
      Draws.AttractDraw.name, // 更新磁贴
      Draws.RulerDraw.name, // 更新比例尺
      Draws.RefLineDraw.name, // 更新参考线
      Draws.PreviewDraw.name, // 更新预览
      Draws.ContextmenuDraw.name // 更新右键菜单
    ]

    // // 可以以此发现缺失的 draw
    // console.log('redraw', drawNames)
    // console.trace()

    if (Array.isArray(drawNames) && !this.debug) {
      // 选择性 draw 也要保持顺序
      for (const name of all) {
        if (drawNames.includes(name)) {
          this.draws[name]?.draw()
        }
      }
    } else {
      for (const name of all) {
        this.draws[name]?.draw()
      }
    }
  }

  changeDraggable(disabled: boolean) {
    this.layer.children.forEach((asset) => {
      asset.draggable(disabled)
    })
  }

  // 改变画图类型
  changeGraphType(type?: Types.GraphType) {
    if (type) {
      this.texting = false
      this.emit('texting-change', this.texting)
    }

    this.graphType = type
    this.emit('graph-type-change', this.graphType)

    // 绘制 Graph 的时候，不允许直接拖动其他素材
    this.changeDraggable(!this.config.readonly && this.graphType === void 0)
  }

  // 添加文字状态
  changeTexting(texting: boolean) {
    if (texting) {
      this.graphType = undefined
      this.emit('graph-type-change', this.graphType)
    }

    this.texting = texting
    this.emit('texting-change', this.texting)

    document.body.style.cursor = this.texting ? 'text' : 'default'
  }

  // 页面设置 默认值
  static PageSettingsDefault: Types.PageSettings = {
    background: 'transparent',
    stroke: 'rgb(0,0,0)',
    strokeWidth: 1,
    fill: 'rgb(0,0,0)',
    linkStroke: 'rgb(0,0,0)',
    linkStrokeWidth: 1,
    fontSize: 24,
    textFill: 'rgb(0,0,0)'
  }

  // 获取页面设置
  getPageSettings(): Types.PageSettings {
    return this.stage.attrs.pageSettings ?? { ...Render.PageSettingsDefault }
  }

  // 更新页面设置
  setPageSettings(settings: Types.PageSettings, update = false) {
    this.stage.setAttr('pageSettings', settings)

    // 更新背景
    this.updateBackground()

    if (update) {
      // 更新历史
      this.updateHistory()
    }
  }

  // 获取背景
  getBackground() {
    return this.draws[Draws.BgDraw.name]?.layer.findOne(
      `.${Draws.BgDraw.name}__background`
    ) as Konva.Rect
  }

  // 更新背景
  updateBackground() {
    const background = this.getBackground()

    if (background) {
      background.fill(this.getPageSettings().background ?? 'transparent')
    }

    this.draws[Draws.BgDraw.name]?.draw()
    this.draws[Draws.GraphDraw.name]?.draw()
    this.draws[Draws.LinkDraw.name]?.draw()
    this.draws[Draws.PreviewDraw.name]?.draw()
  }

  // 素材设置 默认值
  static AssetSettingsDefault: Types.AssetSettings = {
    stroke: '',
    strokeWidth: 0,
    fill: '',
    arrowStart: false,
    arrowEnd: false,
    fontSize: 0,
    textFill: '',
    text: 'Text',
    x: 0,
    y: 0,
    rotation: 0,
    tension: 0
  }

  // 获取素材设置
  getAssetSettings(asset?: Konva.Node): Types.AssetSettings {
    const base = asset?.attrs.assetSettings ?? { ...Render.AssetSettingsDefault }

    return {
      // 特定
      ...base,
      // 继承全局
      stroke: base.stroke || this.getPageSettings().stroke,
      strokeWidth: base.strokeWidth || this.getPageSettings().strokeWidth,
      fontSize: base.fontSize || this.getPageSettings().fontSize,
      textFill: base.textFill || this.getPageSettings().textFill,
      // 绘制图形，默认不填充
      fill:
        base.fill ||
        (asset?.attrs.assetType === Types.AssetType.Graph
          ? 'transparent'
          : this.getPageSettings().fill),
      x: parseFloat((asset?.position().x ?? 0).toFixed(1)),
      y: parseFloat((asset?.position().y ?? 0).toFixed(1)),
      rotation: parseFloat((asset?.rotation() ?? 0).toFixed(1)),
      tension:
        asset?.attrs.assetType === Types.AssetType.Graph &&
        asset?.attrs.graphType === Types.GraphType.Curve
          ? base.tension
          : undefined
    }
  }

  // 设置 svgXML 样式（部分）
  setSvgXMLSettings(xml: string, settings: Types.AssetSettings) {
    const reg = /<(circle|ellipse|line|path|polygon|rect|text|textPath|tref|tspan)[^>/]*\/?>/g

    const shapes = xml.match(reg)

    const regStroke = / stroke="([^"]*)"/
    const regFill = / fill="([^"]*)"/

    for (const shape of shapes ?? []) {
      let result = shape

      if (settings.stroke) {
        if (regStroke.test(shape)) {
          result = result.replace(regStroke, ` stroke="${settings.stroke}"`)
        } else {
          result = result.replace(/(<[^>/]*)(\/?>)/, `$1 stroke="${settings.stroke}" $2`)
        }
      }

      if (settings.fill) {
        if (regFill.test(shape)) {
          result = result.replace(regFill, ` fill="${settings.fill}"`)
        } else {
          result = result.replace(/(<[^>/]*)(\/?>)/, `$1 fill="${settings.fill}" $2`)
        }
      }

      xml = xml.replace(shape, result)
    }

    return xml
  }

  rotatePoint({ x, y }: { x: number; y: number }, rad: number) {
    const rCos = Math.cos(rad)
    const rSin = Math.sin(rad)
    return { x: x * rCos - y * rSin, y: y * rCos + x * rSin }
  }

  rotateAroundCenter(node: Konva.Node, rotation: number) {
    const topLeft = { x: -node.width() / 2, y: -node.height() / 2 }
    const current = this.rotatePoint(topLeft, Konva.getAngle(node.rotation()))
    const rotated = this.rotatePoint(topLeft, Konva.getAngle(rotation))
    const dx = rotated.x - current.x,
      dy = rotated.y - current.y

    node.rotation(rotation)
    node.x(node.x() + dx)
    node.y(node.y() + dy)
  }

  // 更新素材设置
  async setAssetSettings(asset: Konva.Node, settings: Types.AssetSettings, update = false) {
    asset.setAttr('assetSettings', settings)
    if (asset instanceof Konva.Group) {
      if (asset.attrs.imageType === Types.ImageType.svg) {
        const node = asset.children[0] as Konva.Shape
        if (node instanceof Konva.Image) {
          if (node.attrs.svgXML) {
            const n = await this.assetTool.loadSvgXML(
              this.setSvgXMLSettings(node.attrs.svgXML, settings)
            )
            node.parent?.add(n)
            node.remove()
            node.destroy()
            n.zIndex(0)
          }
        }
      } else if (asset.attrs.assetType === Types.AssetType.Graph) {
        const node = asset.findOne('.graph')
        if (node instanceof Konva.Shape) {
          node.strokeWidth(settings.strokeWidth)
          node.stroke(settings.stroke)
          if (node instanceof Konva.Arrow) {
            // 箭头跟随 stroke
            node.fill(settings.stroke)
          } else {
            node.fill(settings.fill)
          }
          if (node instanceof Konva.Arrow) {
            node.pointerAtBeginning(settings.arrowStart)
            node.pointerAtEnding(settings.arrowEnd)
          }
          if (node instanceof Konva.Arrow && asset.attrs.graphType === Types.GraphType.Curve) {
            node.tension(settings.tension)
          }
        }
      } else if (asset.attrs.assetType === Types.AssetType.Text) {
        const node = asset.findOne('Text')
        const rect = asset.findOne('Rect')

        if (node instanceof Konva.Text && rect instanceof Konva.Rect) {
          let sizeChanged = false
          if (node.fontSize() !== settings.fontSize || node.text() !== settings.text) {
            sizeChanged = true
          }

          node.fill(settings.textFill)
          node.fontSize(settings.fontSize)
          node.text(settings.text)

          // 内容为空时，给一个半透明背景色
          rect.fill(node.text().trim() ? '' : 'rgba(0,0,0,0.1)')
          rect.width(Math.max(node.width(), settings.fontSize))
          rect.height(Math.max(node.height(), settings.fontSize))

          // 刷新 transformer 大小
          if (sizeChanged) {
            this.selectionTool.select([asset])
          }
        }
      }

      // rotate 会影响 position，不能同时改变
      // 区分属性面板正在调整
      if (Math.abs(settings.rotation - asset.rotation()) >= 0.1) {
        this.rotateAroundCenter(asset, settings.rotation)

        // 同步 position 的变化
        this.emit('asset-position-change', [asset])
      } else {
        const prevSettings = this.getAssetSettings(asset)

        asset.position({
          x: parseFloat(settings.x.toFixed(1)),
          y: parseFloat(settings.y.toFixed(1))
        })

        // 外部调用变化同步
        if (settings.x !== prevSettings.x || settings.y !== prevSettings.y) {
          this.emit('asset-position-change', [asset])
        }
      }
    }

    if (update) {
      // 更新历史
      this.updateHistory()
    }

    this.draws[Draws.BgDraw.name]?.draw()
    this.draws[Draws.GraphDraw.name]?.draw()
    this.draws[Draws.LinkDraw.name]?.draw()
    this.draws[Draws.PreviewDraw.name]?.draw()
  }

  // 连接线设置 默认值
  static LinkSettingsDefault: Types.LinkSettings = {
    stroke: '',
    strokeWidth: 0,
    arrowStart: false,
    arrowEnd: false,
    tension: 0
  }

  // 连接线设置
  async setLinkSettings(link: Konva.Line, settings: Types.LinkSettings, update = false) {
    const group = this.layer.findOne(`#${link.attrs.groupId}`)
    if (Array.isArray(group?.attrs.points)) {
      const point = (group?.attrs.points as Types.LinkDrawPoint[]).find(
        (o: Types.LinkDrawPoint) => o.id === link.attrs.pointId
      )
      if (point) {
        const pair = point.pairs.find((o) => o.id === link.attrs.pairId)
        if (pair) {
          pair.style = {
            ...pair.style,
            ...settings
          }

          group.setAttr('points', group?.attrs.points)
        }
      }
    }

    if (update) {
      // 更新历史
      this.updateHistory()
    }

    this.draws[Draws.BgDraw.name]?.draw()
    this.draws[Draws.GraphDraw.name]?.draw()
    this.draws[Draws.LinkDraw.name]?.draw()
    this.draws[Draws.PreviewDraw.name]?.draw()
  }

  // 获取连接线设置
  getLinkSettings(link?: Konva.Line): Types.LinkSettings {
    let settings: (Konva.LineConfig & Types.LinkSettings) | undefined = undefined
    if (link) {
      const group = this.layer.findOne(`#${link.attrs.groupId}`)
      if (Array.isArray(group?.attrs.points)) {
        const point = (group?.attrs.points as Types.LinkDrawPoint[]).find(
          (o: Types.LinkDrawPoint) => o.id === link.attrs.pointId
        )
        if (point) {
          const pair = point.pairs.find((o) => o.id === link.attrs.pairId)
          if (pair) {
            settings = pair.style
          }
        }
      }
    }

    const base = settings ?? { ...Render.LinkSettingsDefault }

    return {
      // 特定
      ...base,
      // 继承全局
      stroke: (base.stroke as string) || this.getPageSettings().linkStroke,
      strokeWidth: base.strokeWidth || this.getPageSettings().linkStrokeWidth
    }
  }
}

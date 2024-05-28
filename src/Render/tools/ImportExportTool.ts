import Konva from 'konva'
import C2S from 'canvas2svg'
//
import { Render } from '../index'
//
import * as Draws from '../draws'
//
import { LinkPointEventBind } from '../LinkPointHandlers'

export class ImportExportTool {
  static readonly name = 'ImportExportTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  getView() {
    // 复制画布
    const copy = this.render.stage.clone()
    // 提取 main layer 备用
    const main = copy.find('#main')[0] as Konva.Layer
    // 暂时清空所有 layer
    copy.removeChildren()

    // 提取节点
    let nodes = main.getChildren((node) => {
      return !this.render.ignore(node) && !this.render.ignoreDraw(node)
    })

    // 重新装载节点
    const layer = new Konva.Layer()
    layer.add(...nodes)
    nodes = layer.getChildren()

    // 计算节点占用的区域
    let minX = 0
    let maxX = copy.width() - this.render.rulerSize
    let minY = 0
    let maxY = copy.height() - this.render.rulerSize
    for (const node of nodes) {
      const x = node.x()
      const y = node.y()
      const width = node.width()
      const height = node.height()

      if (x < minX) {
        minX = x
      }
      if (x + width > maxX) {
        maxX = x + width
      }
      if (y < minY) {
        minY = y
      }
      if (y + height > maxY) {
        maxY = y + height
      }

      if (node.attrs.nodeMousedownPos) {
        // 修正正在选中的节点透明度
        node.setAttrs({
          opacity: copy.attrs.lastOpacity ?? 1
        })
      }
    }

    // 重新装载 layer
    copy.add(layer)

    // 节点占用的区域
    copy.setAttrs({
      x: -minX,
      y: -minY,
      scale: { x: 1, y: 1 },
      width: maxX - minX,
      height: maxY - minY
    })

    // 返回可视节点和 layer
    return copy
  }

  // 保存
  save() {
    const copy = this.getView()

    // 通过 stage api 导出 json
    return copy.toJSON()
  }

  // 加载 image（用于导入）
  loadImage(src: string) {
    return new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image()
      img.onload = () => {
        // 返回加载完成的图片 element
        resolve(img)
      }
      img.onerror = () => {
        resolve(null)
      }
      img.src = src
    })
  }

  // 恢复图片（用于导入）
  async restoreImage(nodes: Konva.Node[] = []) {
    for (const node of nodes) {
      if (node instanceof Konva.Group) {
        // 递归
        await this.restoreImage(node.getChildren())
      } else if (node instanceof Konva.Image) {
        // 处理图片
        if (node.attrs.svgXML) {
          // svg 素材
          const blob = new Blob([node.attrs.svgXML], { type: 'image/svg+xml' })
          // dataurl
          const url = URL.createObjectURL(blob)
          // 加载为图片 element
          const image = await this.loadImage(url)
          if (image) {
            // 设置图片
            node.image(image)
          }
        } else if (node.attrs.gif) {
          // gif 素材
          const imageNode = await this.render.assetTool.loadGif(node.attrs.gif)
          if (imageNode) {
            // 设置图片
            node.image(imageNode.image())
          }
        } else if (node.attrs.src) {
          // 其他图片素材
          const image = await this.loadImage(node.attrs.src)
          if (image) {
            // 设置图片
            node.image(image)
          }
        }
      }
    }
  }

  // 恢复
  async restore(json: string, silent = false) {
    try {
      // 清空选择
      this.render.selectionTool.selectingClear()

      // 清空 main layer 节点
      this.render.layer.removeChildren()

      // 加载 json，提取节点
      const container = document.createElement('div')
      const stage = Konva.Node.create(json, container)
      const main = stage.getChildren()[0]
      const nodes = main.getChildren()

      const linkDrawState = (this.render.draws[Draws.LinkDraw.name] as Draws.LinkDraw).state

      linkDrawState.linkGroupNode = null
      linkDrawState.linkFrom = {
        group: null,
        circle: null
      }
      linkDrawState.linkTo = {
        group: null,
        circle: null
      }
      linkDrawState.linkPairs = []
      linkDrawState.linkPoint = {
        pair: null,
        pointCircle: null,
        link: null,
        pointGroup: null,
        point: null
      }

      for (const group of nodes.filter((o: Konva.Node) => o.name() === 'link-group')) {
        const link = group.getChildren().find((o: Konva.Node) => o.name() === 'link')

        linkDrawState.linkPairs.push({
          from: {
            groupId: group.attrs.fromGroupId,
            circleId: group.attrs.fromcircleId
          },
          to: {
            groupId: group.attrs.toGroupId,
            circleId: group.attrs.tocircleId
          },
          points: link.attrs.pairPoints,
          selected: false
        })
      }

      for (const group of nodes.filter(
        (o: Konva.Node) => o.name() !== 'link-group' && o.name() !== 'Link'
      )) {
        const points = group.getChildren((o: Konva.Node) => o instanceof Konva.Circle)
        for (const node of points) {
          LinkPointEventBind(this.render, group, node)
        }
      }

      // 恢复节点图片素材
      await this.restoreImage(nodes)

      // 往 main layer 插入新节点
      this.render.layer.add(...nodes)

      // Bug: 恢复 JSON 时候，如果存在已经被放大缩小点元素，点击选择无效
      // 可能是 Konva 的 bug
      this.render.selectionTool.select(this.render.layer.getChildren())
      // 清空选择
      this.render.selectionTool.selectingClear()

      // 上一步、下一步 无需更新 history 记录
      if (!silent) {
        // 更新历史
        this.render.updateHistory()
      }

      // 隐藏连接点
      this.render.layer.find('.point').forEach((node) => {
        node.visible(false)
      })

      // 更新连线
      this.render.draws[Draws.LinkDraw.name].draw()

      // 更新预览
      this.render.draws[Draws.PreviewDraw.name].draw()
    } catch (e) {
      console.error(e)
    }
  }

  // 获取图片
  getImage(pixelRatio = 1, bgColor?: string) {
    // 获取可视节点和 layer
    const copy = this.getView()

    // 背景层
    const bgLayer = new Konva.Layer()

    // 背景矩形
    const bg = new Konva.Rect({
      listening: false
    })
    bg.setAttrs({
      x: -copy.x(),
      y: -copy.y(),
      width: copy.width(),
      height: copy.height(),
      fill: bgColor
    })

    // 添加背景
    bgLayer.add(bg)

    // 插入背景
    const children = copy.getChildren()
    copy.removeChildren()
    copy.add(bgLayer)
    copy.add(children[0], ...children.slice(1))

    // 通过 stage api 导出图片
    return copy.toDataURL({ pixelRatio })
  }

  // blob to base64 url
  blobToBase64(blob: Blob, type: string): Promise<string> {
    return new Promise((resolve) => {
      const file = new File([blob], 'image', { type })
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)
      fileReader.onload = function () {
        resolve((this.result as string) ?? '')
      }
    })
  }

  // 替换 svg blob: 链接
  parseSvgImage(urls: string[]): Promise<string[]> {
    return new Promise((resolve) => {
      if (urls.length > 0) {
        Promise.all(urls.map((o) => fetch(o))).then((rs: Response[]) => {
          // fetch

          // 替换为 svg 嵌套
          Promise.all(rs.map((o) => o.text())).then((xmls: string[]) => {
            // svg xml
            resolve(xmls)
          })
        })
      } else {
        resolve([])
      }
    })
  }

  // 替换其他 image 链接
  parseOtherImage(urls: string[]): Promise<string[]> {
    return new Promise((resolve) => {
      if (urls.length > 0) {
        Promise.all(urls.map((o) => fetch(o))).then((rs: Response[]) => {
          // fetch

          // 替换为 base64 url image
          Promise.all(rs.map((o) => o.blob())).then((bs: Blob[]) => {
            // blob
            Promise.all(bs.map((o) => this.blobToBase64(o, 'image/*'))).then((urls: string[]) => {
              // base64
              resolve(urls)
            })
          })
        })
      } else {
        resolve([])
      }
    })
  }

  // 替换 image 链接
  parseImage(xml: string): Promise<string> {
    return new Promise((resolve) => {
      // 找出 blob:http 图片链接（目前发现只有 svg 是）
      const svgs = xml.match(/(?<=xlink:href=")blob:https?:\/\/[^"]+(?=")/g) ?? []
      // 其他图片转为 base64
      const imgs = xml.match(/(?<=xlink:href=")(?<!blob:)[^"]+(?=")/g) ?? []

      Promise.all([this.parseSvgImage(svgs), this.parseOtherImage(imgs)]).then(
        ([svgXmls, imgUrls]) => {
          // svg xml
          svgs.forEach((svg, idx) => {
            // 替换
            xml = xml.replace(
              new RegExp(`<image[^><]* xlink:href="${svg}"[^><]*/>`),
              svgXmls[idx].match(/<svg[^><]*>.*<\/svg>/)?.[0] ?? '' // 仅保留 svg 结构
            )
          })

          // base64
          imgs.forEach((img, idx) => {
            // 替换
            xml = xml.replace(`"${img}"`, `"${imgUrls[idx]}"`)
          })

          // 替换完成
          resolve(xml)
        }
      )
    })
  }

  // 获取Svg
  async getSvg() {
    // 获取可视节点和 layer
    const copy = this.getView()
    // 获取 main layer
    const main = copy.children[0] as Konva.Layer
    // 获取 layer 的 canvas context
    const ctx = main.canvas.context._context

    if (ctx) {
      // 创建 canvas2svg
      const c2s = new C2S({ ctx, ...main.size() })
      // 替换 layer 的 canvas context
      main.canvas.context._context = c2s
      // 重绘
      main.draw()

      // 获得 svg
      const rawSvg = c2s.getSerializedSvg()
      console.log(rawSvg)
      // 替换 image 链接
      const svg = await this.parseImage(rawSvg)
      console.log(svg)

      // 输出 svg
      return svg
    }
    return Promise.resolve(
      `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0"></svg>`
    )
  }
}

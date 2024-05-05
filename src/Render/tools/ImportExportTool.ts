import Konva from 'konva'
//
import { Render } from '../index'
//
import * as Draws from '../draws'

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

      // 恢复节点图片素材
      await this.restoreImage(nodes)

      // 往 main layer 插入新节点
      this.render.layer.add(...nodes)

      // 上一步、下一步 无需更新 history 记录
      if (!silent) {
        // 更新历史
        this.render.updateHistory()
      }

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
}

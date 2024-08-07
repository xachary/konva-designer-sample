import Konva from 'konva'
//
import { Render } from '../index'
//
import * as Draws from '../draws'

const gifler = window.gifler

export class AssetTool {
  static readonly name = 'AssetTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  // 加载 svg xml
  async loadSvgXML(svgXML: string) {
    const blob = new Blob([svgXML], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    return new Promise<Konva.Image>((resolve) => {
      Konva.Image.fromURL(url, (imageNode) => {
        imageNode.setAttrs({
          svgXML
        })
        resolve(imageNode)
      })
    })
  }

  // 加载 svg
  async loadSvg(src: string) {
    const svgXML = await (await fetch(src)).text()
    return this.loadSvgXML(svgXML)
  }

  // 加载 gif
  async loadGif(src: string) {
    return new Promise<Konva.Image>((resolve) => {
      const img = document.createElement('img')
      img.onload = () => {
        const canvas = document.createElement('canvas')

        canvas.width = img.naturalWidth
        canvas.height = img.naturalWidth

        img.remove()

        const gif = gifler(src)

        gif.frames(canvas, (ctx: CanvasRenderingContext2D, frame: any) => {
          ctx.drawImage(frame.buffer, 0, 0)

          this.render.layer.draw()
          // 更新预览（layer）
          this.render.draws[Draws.PreviewDraw.name].layer.draw()
        })

        resolve(
          new Konva.Image({
            image: canvas, // TODO: 拖动 gif 素材产生大量 JS event listeners
            gif: src
          })
        )
      }
      img.src = src
    })
  }

  // 加载图片
  async loadImg(src: string) {
    return new Promise<Konva.Image>((resolve) => {
      Konva.Image.fromURL(src, (imageNode) => {
        imageNode.setAttrs({ src })
        resolve(imageNode)
      })
    })
  }

  // 加载节点 json
  async loadJson(src: string) {
    try {
      // 读取 json内容
      const json = JSON.parse(await (await fetch(src)).text())

      // 子素材
      const assets = json.children

      // 刷新id
      this.render.linkTool.jsonIdCover(assets)

      // 生成空白 stage+layer
      const stageEmpty = new Konva.Stage({
        container: document.createElement('div')
      })
      const layerEmpty = new Konva.Layer()
      stageEmpty.add(layerEmpty)

      // 空白 json 根
      const jsonRoot = JSON.parse(stageEmpty.toJSON())
      jsonRoot.children[0].children = [json]

      // 重新加载 stage
      const stageReload = Konva.Node.create(JSON.stringify(jsonRoot), document.createElement('div'))

      // 目标 group（即 json 转化后的节点）
      const groupTarget = stageReload.children[0].children[0] as Konva.Group

      // 释放内存
      stageEmpty.destroy()
      groupTarget.remove()
      stageReload.destroy()

      // 深度遍历加载子素材
      const nodes: {
        target: Konva.Stage | Konva.Layer | Konva.Group | Konva.Node
        parent?: Konva.Stage | Konva.Layer | Konva.Group | Konva.Node
      }[] = [{ target: groupTarget }]

      while (nodes.length > 0) {
        const item = nodes.shift()
        if (item) {
          const node = item.target
          if (node instanceof Konva.Image) {
            if (node.attrs.svgXML) {
              const n = await this.loadSvgXML(node.attrs.svgXML)
              n.listening(false)
              node.parent?.add(n)
              node.remove()
            } else if (node.attrs.gif) {
              const n = await this.loadGif(node.attrs.gif)
              n.listening(false)
              node.parent?.add(n)
              node.remove()
            } else if (node.attrs.src) {
              const n = await this.loadImg(node.attrs.src)
              n.listening(false)
              node.parent?.add(n)
              node.remove()
            }
          }
          if (
            node instanceof Konva.Stage ||
            node instanceof Konva.Layer ||
            node instanceof Konva.Group
          ) {
            nodes.push(
              ...node.getChildren().map((o) => ({
                target: o,
                parent: node
              }))
            )
          }
        }
      }

      // 作用：点击空白区域可选择
      const clickMask = new Konva.Rect({
        id: 'click-mask',
        width: groupTarget.width(),
        height: groupTarget.height()
      })
      groupTarget.add(clickMask)
      clickMask.zIndex(1)

      return groupTarget
    } catch (e) {
      console.error(e)
      return new Konva.Group()
    }
  }
}

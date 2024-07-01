import { nanoid } from 'nanoid'
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
      const canvas = document.createElement('canvas')

      gifler(src).frames(canvas, (ctx: CanvasRenderingContext2D, frame: any) => {
        canvas.width = frame.width
        canvas.height = frame.height
        ctx.drawImage(frame.buffer, 0, 0)

        this.render.layer.draw()
        // 更新预览
        this.render.draws[Draws.PreviewDraw.name].draw()

        resolve(
          new Konva.Image({
            image: canvas,
            gif: src
          })
        )
      })
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
      // console.log(json)
      const stage = new Konva.Stage({
        container: document.createElement('div')
      })
      const layer = new Konva.Layer()
      stage.add(layer)
      const parent = JSON.parse(stage.toJSON())
      parent.children[0].children = [json]
      const stage2 = Konva.Node.create(JSON.stringify(parent), document.createElement('div'))
      const group = stage2.children[0].children[0] as Konva.Group
      // console.log(3, JSON.parse(stage2.toJSON()))
      // console.log(stage2.children[0].children[0])

      const nodes: {
        target: Konva.Stage | Konva.Layer | Konva.Group | Konva.Node
        parent?: Konva.Stage | Konva.Layer | Konva.Group | Konva.Node
      }[] = [{ target: group }]

      while (nodes.length > 0) {
        const item = nodes.shift()
        if (item) {
          const node = item.target
          if (node instanceof Konva.Image) {
            if (node.attrs.svgXML) {
              // console.log('svg', node.attrs.svgXML)
              const n = await this.loadSvgXML(node.attrs.svgXML)
              n.listening(false)
              node.parent?.add(n)
              node.remove()
            } else if (node.attrs.gif) {
              // console.log('gif', node.attrs.gif)
              const n = await this.loadGif(node.attrs.gif)
              n.listening(false)
              node.parent?.add(n)
              node.remove()
            } else if (node.attrs.src) {
              // console.log('img', node.attrs.src)
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

      // 临时 stage、layer、sub-asset group
      // 生成 json 并包装 json内容
      // 临时 stage 恢复 生成 json
      // 返回节点 sub-asset group

      // TODO: 重新绑定连接点 deep

      // 点击空白区域可选择
      const mask = new Konva.Rect({
        width: group.width(),
        height: group.height(),
      })

      group.add(mask)

      mask.zIndex(1)

      return group
    } catch (e) {
      console.error(e)
      return new Konva.Group()
    }
  }
}

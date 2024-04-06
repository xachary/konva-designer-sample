import Konva from 'konva'
//
import { Render } from '../index'

const gifler = window.gifler

export class AssetTool {
  static readonly name = 'AssetTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  // 加载 svg
  async loadSvg(src: string) {
    const svgXML = await (await fetch(src)).text()
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

  // 加载 gif
  async loadGif(src: string) {
    return new Promise<Konva.Image>((resolve) => {
      const canvas = document.createElement('canvas')

      gifler(src).frames(canvas, (ctx: CanvasRenderingContext2D, frame: any) => {
        canvas.width = frame.width
        canvas.height = frame.height
        ctx.drawImage(frame.buffer, 0, 0)

        this.render.layer.draw()

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
}

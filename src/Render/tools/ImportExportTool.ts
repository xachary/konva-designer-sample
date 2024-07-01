import { nanoid } from 'nanoid'
import Konva from 'konva'
import C2S from 'canvas2svg'
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

  /**
   * 获得显示内容
   * @param withLink 是否包含线条
   * @returns
   */
  getView(withLink: boolean = false) {
    // 复制画布
    const copy = this.render.stage.clone()
    // 提取 main layer 备用
    const main = copy.find('#main')[0] as Konva.Layer
    const cover = copy.find('#cover')[0] as Konva.Layer
    // 暂时清空所有 layer
    copy.removeChildren()

    // 提取节点
    let nodes = main.getChildren((node) => {
      return !this.render.ignore(node)
    })

    // 移除多余结构
    for (const node of nodes) {
      for (const child of (node as Konva.Group).children) {
        if (this.render.ignoreSelect(child)) {
          child.remove()
        }
      }
    }

    if (withLink) {
      nodes = nodes.concat(
        cover.getChildren((node) => {
          return node.name() === Draws.LinkDraw.name
        })
      )
    }

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

      for (const node of nodes) {
        node.off('mouseenter')
        node.on('mouseenter', () => {
          // 显示 连接点
          this.render.linkTool.pointsVisible(true, node)
        })
        node.off('mouseleave')
        node.on('mouseleave', () => {
          // 隐藏 连接点
          this.render.linkTool.pointsVisible(false, node)

          // 隐藏 hover 框
          node.findOne('#hoverRect')?.visible(false)
        })
      }

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

      // 隐藏 连接点
      this.render.linkTool.pointsVisible(false)

      // 更新连线
      this.render.draws[Draws.LinkDraw.name].draw()
      // 更新磁贴
      this.render.draws[Draws.AttractDraw.name].draw()
      // 更新预览
      this.render.draws[Draws.PreviewDraw.name].draw()
    } catch (e) {
      console.error(e)
    }
  }

  // 获取图片
  getImage(pixelRatio = 1, bgColor?: string) {
    // 获取可视节点和 layer
    const copy = this.getView(true)

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
    const copy = this.getView(true)
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

  getAsset() {
    const copy = this.getView()
    const children = copy.getChildren()[0].getChildren()

    const nodes: Konva.Stage | Konva.Layer | Konva.Group | Konva.Node[] = [...children]

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity,
      minStartX = Infinity,
      minStartY = Infinity

    for (const node of nodes) {
      if (node instanceof Konva.Group) {
        if (node.x() < minX) {
          minX = node.x()
        }
        if (node.x() + node.width() > maxX) {
          maxX = node.x() + node.width()
        }
        if (node.y() < minY) {
          minY = node.y()
        }
        if (node.y() + node.height() > maxY) {
          maxY = node.y() + node.height()
        }

        if (node.x() < minStartX) {
          minStartX = node.x()
        }
        if (node.y() < minStartY) {
          minStartY = node.y()
        }
      }
    }

    for (const node of nodes) {
      node.x(node.x() - minStartX)
      node.y(node.y() - minStartY)
    }

    const json = copy.toJSON()
    const obj = JSON.parse(json)
    const assets = obj.children[0].children

    let deepAssets = [...assets]
    let numId = 0
    const idMap = new Map()

    while (deepAssets.length > 0) {
      const asset = deepAssets.shift()
      if (asset) {
        if (Array.isArray(asset.attrs.points)) {
          for (const point of asset.attrs.points) {
            if (Array.isArray(point.pairs)) {
              for (const pair of point.pairs) {
                if (pair.id) {
                  pair.id = 'pr:' + numId++
                }

                if (pair.from.groupId && !idMap.has(pair.from.groupId)) {
                  idMap.set(pair.from.groupId, 'g:' + numId++)
                }

                if (pair.to.groupId && !idMap.has(pair.to.groupId)) {
                  idMap.set(pair.to.groupId, 'g:' + numId++)
                }

                if (pair.from.pointId && !idMap.has(pair.from.pointId)) {
                  idMap.set(pair.from.pointId, 'p:' + numId++)
                }

                if (pair.to.pointId && !idMap.has(pair.to.pointId)) {
                  idMap.set(pair.to.pointId, 'p:' + numId++)
                }
              }
            }

            if (point.id) {
              if (!idMap.has(point.id)) {
                idMap.set(point.id, 'p:' + numId++)
              }
            }

            if (point.groupId) {
              if (!idMap.has(point.groupId)) {
                idMap.set(point.groupId, 'g:' + numId++)
              }
            }
          }
        }

        if (asset.attrs.id) {
          if (!idMap.has(asset.attrs.id)) {
            idMap.set(asset.attrs.id, 'n:' + numId++)
          }
        }

        if (Array.isArray(asset.children)) {
          deepAssets.push(...asset.children)
        }
      }
    }

    deepAssets = [...assets]

    console.log(assets)
    console.log(idMap)

    while (deepAssets.length > 0) {
      const asset = deepAssets.shift()
      if (asset) {
        if (idMap.has(asset.attrs.id)) {
          asset.attrs.id = idMap.get(asset.attrs.id)
        }

        if (Array.isArray(asset.attrs.points)) {
          for (const point of asset.attrs.points) {
            if (Array.isArray(point.pairs)) {
              for (const pair of point.pairs) {
                if (idMap.has(pair.from.groupId)) {
                  pair.from.groupId = idMap.get(pair.from.groupId)
                }
                if (idMap.has(pair.to.groupId)) {
                  pair.to.groupId = idMap.get(pair.to.groupId)
                }
                if (idMap.has(pair.from.pointId)) {
                  pair.from.pointId = idMap.get(pair.from.pointId)
                }
                if (idMap.has(pair.to.pointId)) {
                  pair.to.pointId = idMap.get(pair.to.pointId)
                }
              }
            }

            if (idMap.has(point.id)) {
              point.id = idMap.get(point.id)
            }

            if (idMap.has(point.groupId)) {
              point.groupId = idMap.get(point.groupId)
            }
          }
        }

        if (Array.isArray(asset.children)) {
          deepAssets.push(...asset.children)
        }
      }
    }

    console.log(assets)

    //     if (asset.className === 'Group' && asset.attrs.name === 'asset') {
    //       asset.attrs.id = 'a:' + nanoid()
    //       asset.attrs.name = undefined
    //       if (Array.isArray(asset.attrs.points)) {
    //         for (const point of asset.attrs.points) {
    //           point.groupId = asset.attrs.id
    //         }
    //         allPoints.push(...asset.attrs.points)
    //       }
    //     } else if (asset.className === 'Circle' && asset.attrs.name === 'link-anchor') {
    //       allAnchors.push(asset)
    //     }

    // console.log('allPoints', allPoints)
    // console.log('allAnchors', allAnchors)
    // for (const point of allPoints) {
    //   if (Array.isArray(point.pairs)) {
    //     for (const pair of point.pairs) {
    //       pair.id = 'pr:' + nanoid()

    //       for (const anchor of allAnchors) {
    //         if (pair.from.pointId === anchor.attrs.id) {
    //           // point.id = 'p:' + nanoid()
    //           // anchor.attrs.id = point.id

    //           // pair.from.groupId = ''
    //           // pair.from.pointId = ''
    //         } else if (pair.to.pointId === anchor.attrs.id) {
    //           // point.id = 'p:' + nanoid()
    //           // anchor.attrs.id = point.id

    //           // pair.from.groupId = ''
    //           // pair.from.pointId = ''
    //         }
    //       }
    //     }
    //   }
    // }
    // for (const point of allPoints) {
    //   if (Array.isArray(point.pairs)) {
    //     for (const pair of point.pairs) {
    //       // pair.id = 'r:' + nanoid()
    //     }
    //   }
    //   for (const anchor of allAnchors) {
    //     if (point.id === anchor.attrs.id) {
    //       point.id = 'p:' + nanoid()
    //       anchor.attrs.id = point.id
    //     }
    //   }
    // }

    // console.log('allPoints2', allPoints)
    // console.log('allAnchors2', allAnchors)

    // 移除所有 .asset
    // 实例化所有连线，移除所有 .link-*、link信息
    // 用新的 .asset 包装

    // 导出 stage json
    // 导入 stage json 到 新 stage
    // 从新 stage 获取根 .asset

    // 通过 stage api 导出 json
    return JSON.stringify({
      ...obj.children[0],
      className: 'Group',
      attrs: {
        width: maxX - minX,
        height: maxY - minY,
        x: 0,
        y: 0
      }
    })
  }
}

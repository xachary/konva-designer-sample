import Konva from 'konva'
import * as Types from './types'

// 渲染器
export class Render {
  stage: Konva.Stage

  // 主要层
  layer: Konva.Layer = new Konva.Layer({ id: 'main' })

  // 配置
  config: Types.RenderConfig

  constructor(stageEle: HTMLDivElement, config: Types.RenderConfig) {
    this.config = config

    this.stage = new Konva.Stage({
      container: stageEle,
      width: config.width,
      height: config.height
    })

    // 初始化
    this.init()
  }

  testRect = new Konva.Rect({
    x: 0,
    y: 0,
    fill: 'rgba(0,255,0,0.2)',
    stroke: 'rgba(0,0,255,0.8)'
  })

  // 初始化
  init() {
    this.stage.add(this.layer)

    // 测试
    this.layer.add(this.testRect)
  }

  // 更新 stage 尺寸
  resize(width: number, height: number) {
    this.stage.setAttrs({
      width: width,
      height: height
    })

    this.testRect.setAttrs({
      width: this.stage.width(),
      height: this.stage.height()
    })
  }
}

import Konva from 'konva'
//
import { Render } from '../index'
//
import * as Draws from '../draws'

import type { LinkDrawPair } from '../draws/LinkDraw'

const gifler = window.gifler

export class LinkTool {
  static readonly name = 'LinkTool'

  private render: Render
  constructor(render: Render) {
    this.render = render
  }

  updateSelection(pair?: LinkDrawPair) {
    const linkDrawState = (this.render.draws[Draws.LinkDraw.name] as Draws.LinkDraw).state

    linkDrawState.linkPairs.forEach((o) => {
      o.selected = false
    })

    if (pair) {
      pair.selected = true
    }

    // 更新连线
    this.render.draws[Draws.LinkDraw.name].draw()
    // 更新预览
    this.render.draws[Draws.PreviewDraw.name].draw()
  }

  remove(node: Konva.Node) {
    const linkDrawState = (this.render.draws[Draws.LinkDraw.name] as Draws.LinkDraw).state
    const index = linkDrawState.linkPairs.findIndex(
      (o) => o.from.groupId === node.attrs.fromGroupId && o.to.groupId === node.attrs.toGroupId
    )
    if (index > -1) {
      linkDrawState.linkPairs.splice(index, 1)
    }

    // 更新连线
    this.render.draws[Draws.LinkDraw.name].draw()
    // 更新预览
    this.render.draws[Draws.PreviewDraw.name].draw()
  }
}

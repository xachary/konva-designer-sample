import { Render } from '../index';
//
import * as Draws from '../draws';

export class PositionTool {
  static readonly name = 'PositionTool';

  private render: Render;
  constructor(render: Render) {
    this.render = render;
  }

  // 更新中心
  updateCenter(x = 0, y = 0) {
    const width = this.render.stage.width();
    const height = this.render.stage.height();
    const scaleX = this.render.stage.scaleX();
    const scaleY = this.render.stage.scaleY();

    const nodes = this.render.layer.getChildren((node) => {
      return !this.render.ignore(node);
    });
    let minX = 0;
    let maxX = this.render.layer.width();
    let minY = 0;
    let maxY = this.render.layer.height();
    for (const node of nodes) {
      const x = node.x();
      const y = node.y();
      const width = node.width();
      const height = node.height();

      if (x < minX) {
        minX = x;
      }
      if (x + width > maxX) {
        maxX = x + width;
      }
      if (y < minY) {
        minY = y;
      }
      if (y + height > maxY) {
        maxY = y + height;
      }
    }

    const rx = x + minX;
    const ry = y + minY;

    this.render.stage.setAttrs({
      x: width / 2 - rx * scaleX,
      y: height / 2 - ry * scaleY,
    });

    // 更新背景
    this.render.draws[Draws.BgDraw.name].draw();
    // 更新比例尺
    this.render.draws[Draws.RulerDraw.name].draw();
  }

  // 恢复位置大小
  positionZoomReset() {
    this.render.stage.setAttrs({
      x: this.render.rulerSize,
      y: this.render.rulerSize,
      scale: { x: 1, y: 1 },
    });

    // 更新背景
    this.render.draws[Draws.BgDraw.name].draw();
    // 更新比例尺
    this.render.draws[Draws.RulerDraw.name].draw();
    // 更新参考线
    this.render.draws[Draws.RefLineDraw.name].draw();
  }

  // 恢复位置
  positionReset() {
    this.render.stage.setAttrs({
      x: this.render.rulerSize,
      y: this.render.rulerSize,
    });

    // 更新背景
    this.render.draws[Draws.BgDraw.name].draw();
    // 更新比例尺
    this.render.draws[Draws.RulerDraw.name].draw();
    // 更新参考线
    this.render.draws[Draws.RefLineDraw.name].draw();
  }
}

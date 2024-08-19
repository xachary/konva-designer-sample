```ts
const _sceneFunc = Konva.Ellipse.prototype._sceneFunc

Konva.Ellipse.prototype._sceneFunc = function (context) {
  // _sceneFunc.call(this, context)
  const rx = this.radiusX(),
    ry = this.radiusY(),
    x = this.x(),
    y = this.y()

  context.beginPath()
  context.save()
  // if (rx !== ry) {
  //   context.scale(1, ry / rx)
  // }
  // context.arc(0, 0, rx, 0, Math.PI * 2, false)
  context.ellipse(x - rx, y - ry, rx, ry, 0, 0, Math.PI * 2)

  context.restore()
  context.closePath()
  context.fillStrokeShape(this)
}

C2S.prototype.ellipse = function (
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  rotation: number,
  startAngle: number,
  endAngle: number,
  counterclockwise?: boolean | undefined
) {
  // 【椭圆/圆】a相对、A绝对
  // arx,ry x-axis-rotation large-arc-flag sweep-flag dx,dy
  // rx,ry: 椭圆的两个半轴的长度
  // x-axis-rotation: 是椭圆相对于坐标系的旋转角度，角度数而非弧度数
  // large-arc-flag: 1大弧、0小弧
  // sweep-flag: 1顺时针、0逆时针
  // dx,dy: 圆弧终点坐标
  this.__currentDefaultPath = `M${x - radiusX},${y - radiusY} a${radiusX},${radiusY} 0,1,0 ${x + radiusX * 2},${y + radiusX * 2} Z`
}
```
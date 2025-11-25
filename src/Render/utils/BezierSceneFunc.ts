import Konva from 'konva'

function rotatePoint(x1: number, y1: number, x2: number, y2: number, angleInDegrees: number) {
  const radians = angleInDegrees * (Math.PI / 180)
  const cosTheta = Math.cos(radians)
  const sinTheta = Math.sin(radians)

  // Translate point (x2, y2) to be relative to (x1, y1)
  const x = x2 - x1
  const y = y2 - y1

  // Rotate point
  const xPrime = cosTheta * x - sinTheta * y
  const yPrime = sinTheta * x + cosTheta * y

  // Translate back
  const xNew = xPrime + x1
  const yNew = yPrime + y1

  return { x: xNew, y: yNew }
}

function drawPointer(
  ctx: Konva.Context,
  shape: Konva.Shape,
  startX: number,
  startY: number,
  ctrlX: number,
  ctrlY: number
) {
  const x2 = startX + 12
  const y2 = startY - 6
  const x3 = startX + 12
  const y3 = startY + 6

  const angle = (Math.atan2(ctrlY - startY, ctrlX - startX) * 180) / Math.PI

  const p2 = rotatePoint(startX, startY, x2, y2, angle)
  const p3 = rotatePoint(startX, startY, x3, y3, angle)

  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(p2.x, p2.y)
  ctx.lineTo(p3.x, p3.y)
  ctx.lineTo(startX, startY)
  ctx.lineTo(p2.x, p2.y)

  ctx.strokeShape(shape)
  ctx.fillShape(shape)
}

export function BezierSceneFunc(ctx: Konva.Context, shape: Konva.Shape) {
  if (shape instanceof Konva.Arrow) {
    const ps = shape.points()
    if (ps.length / 2 === 4) {
      // 三次
      ctx.beginPath()

      ctx.moveTo(ps[0], ps[1])
      ctx.bezierCurveTo(ps[2], ps[3], ps[4], ps[5], ps[6], ps[7])
      ctx.strokeShape(shape)

      ctx.closePath()

      shape.pointerAtBeginning() && drawPointer(ctx, shape, ps[0], ps[1], ps[2], ps[3])

      shape.pointerAtEnding() && drawPointer(ctx, shape, ps[6], ps[7], ps[4], ps[5])
    } else if (ps.length / 2 === 3) {
      // 二次
      ctx.beginPath()

      ctx.moveTo(ps[0], ps[1])
      ctx.quadraticCurveTo(ps[2], ps[3], ps[4], ps[5])
      ctx.strokeShape(shape)

      ctx.closePath()

      shape.pointerAtBeginning() && drawPointer(ctx, shape, ps[0], ps[1], ps[2], ps[3])

      shape.pointerAtEnding() && drawPointer(ctx, shape, ps[4], ps[5], ps[2], ps[3])
    } else {
      // 直线
      ctx.beginPath()

      ctx.moveTo(ps[0], ps[1])
      ctx.lineTo(ps[2], ps[3])
      ctx.strokeShape(shape)

      ctx.closePath()

      shape.pointerAtBeginning() && drawPointer(ctx, shape, ps[0], ps[1], ps[2], ps[3])

      shape.pointerAtEnding() && drawPointer(ctx, shape, ps[2], ps[3], ps[0], ps[1])
    }
  }
}

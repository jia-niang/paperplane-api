import { CanvasRenderingContext2D } from 'canvas'

/** 画圆 */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fillStyle: string
) {
  const originFillStyle = ctx.fillStyle

  const startAngle = 0
  const endAngle = 2 * Math.PI

  ctx.beginPath()
  ctx.arc(x, y, r, startAngle, endAngle)
  ctx.fillStyle = fillStyle
  ctx.fill()
  ctx.closePath()

  ctx.fillStyle = originFillStyle
}

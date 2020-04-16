import clip from './index'
import { expect } from 'chai'

describe('test', function () {
  it('if pixi color equal transparent', function () {
    const picture = document.createElement('canvas')
    picture.width = 2
    picture.height = 2
    document.body.appendChild(picture)
    const ctx = picture.getContext('2d') as CanvasRenderingContext2D
    ctx.fillStyle = 'rgb(114,114,114)'
    ctx.fillRect(0, 0, 2, 2)
    ctx.fillStyle = 'rgb(0, 0, 0)'
    ctx.fillRect(1, 1, 1, 1)
    const result = clip(
      picture,
      2,
      2,
      {
        r: 0,
        g: 0,
        b: 0,
        a: 255,
      },
      0,
      {
        r: 255,
        g: 255,
        b: 255,
      }
    )
    const ctx1 = result.getContext('2d') as CanvasRenderingContext2D
    expect(
      Array.from(ctx1.getImageData(0, 0, 2, 2).data).toString()
    ).to.be.equal('114,114,114,255,114,114,114,255,114,114,114,255,0,0,0,0')
  })
})

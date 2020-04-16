# @geeeger/canvas-clip

这是一个canvas抠图工具，并没有使用任何matting算法，仅是以像素点和色彩色差为目标进行抠图

## Usage

```js
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
      // 图源，CanvasImageSource
      picture,
      // 图片大小
      2,
      2,
      // 需要抠除的颜色
      {
        r: 0,
        g: 0,
        b: 0,
        a: 255,
      },
      // 色差（相似度）
      0,
      // 叠加背景色，可选，默认白色，用于rgba转rgb
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
```
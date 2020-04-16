function composition(hex: number, alpha: number, bg: number): number {
  const alphaRadio = alpha / 255.0
  const revertRadio = 1 - alphaRadio
  return revertRadio * bg + alphaRadio * hex
}

type RGBColorType = {
  r: number
  g: number
  b: number
}

type RGBAColorType = RGBColorType & {
  a: number
}

function rgba2rgb(rgba: RGBAColorType, background: RGBColorType): RGBColorType {
  return {
    r: composition(rgba.r, rgba.a, background.r),
    g: composition(rgba.g, rgba.a, background.g),
    b: composition(rgba.b, rgba.a, background.b),
  }
}

type XYZColorType = {
  x: number
  y: number
  z: number
}

function rgb2xyz({ r, g, b }: RGBColorType): XYZColorType {
  let sr = r / 255.0
  let sg = g / 255.0
  let sb = b / 255.0
  sr = sr < 0.04045 ? sr / 12.92 : Math.pow((sr + 0.055) / 1.055, 2.4)
  sg = sg < 0.04045 ? sg / 12.92 : Math.pow((sg + 0.055) / 1.055, 2.4)
  sb = sb < 0.04045 ? sb / 12.92 : Math.pow((sb + 0.055) / 1.055, 2.4)

  return {
    x: 100 * (sr * 0.4124 + sg * 0.3576 + sb * 0.1805),
    y: 100 * (sr * 0.2126 + sg * 0.7152 + sb * 0.0722),
    z: 100 * (sr * 0.0193 + sg * 0.1192 + sb * 0.9505),
  }
}

const REF_X = 96.4221
const REF_Y = 100.0
const REF_Z = 82.5221

function xyzRevise(x: number): number {
  if (x > Math.pow(6.0 / 29.0, 3)) {
    x = Math.pow(x, 1.0 / 3.0)
  } else {
    x = (1.0 / 3.0) * (29.0 / 6.0) * x + 16.0 / 116.0
  }
  return x
}

type LABColorType = {
  l: number
  a: number
  b: number
}

function xyz2lab({ x, y, z }: XYZColorType): LABColorType {
  let x1 = x / REF_X
  let y1 = y / REF_Y
  let z1 = z / REF_Z

  x1 = xyzRevise(x1)
  y1 = xyzRevise(y1)
  z1 = xyzRevise(z1)

  return {
    l: 116.0 * y1 - 16.0,
    a: 500.0 * (x1 - y1),
    b: 200.0 * (y1 - z1),
  }
}

function calcColorDistance(lab2: LABColorType, lab1: LABColorType): number {
  return Math.sqrt(
    Math.pow(lab2.l - lab1.l, 2) +
      Math.pow(lab2.a - lab1.a, 2) +
      Math.pow(lab2.b - lab1.b, 2)
  )
}

export default function clip(
  source: CanvasImageSource,
  width: number,
  height: number,
  targetPixiColor: RGBAColorType,
  colorDistance: number,
  backgroundColor: RGBColorType = { r: 255, g: 255, b: 255 }
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.drawImage(source, 0, 0)
  const imgData = ctx.getImageData(0, 0, width, height)

  const targetPixi = xyz2lab(
    rgb2xyz(rgba2rgb(targetPixiColor, backgroundColor))
  )

  for (let i = 3; i < imgData?.data.length; i += 4) {
    const pixi = xyz2lab(
      rgb2xyz(
        rgba2rgb(
          {
            r: imgData.data[i - 3],
            g: imgData.data[i - 2],
            b: imgData.data[i - 1],
            a: imgData.data[i],
          },
          backgroundColor
        )
      )
    )
    if (Math.abs(calcColorDistance(pixi, targetPixi)) <= colorDistance) {
      imgData.data[i - 3] = imgData.data[i - 2] = imgData.data[
        i - 1
      ] = imgData.data[i] = 0
    }
  }

  ctx.putImageData(imgData, 0, 0)

  return canvas
}

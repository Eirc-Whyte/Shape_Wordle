/**
 *  绘制fillingwords
 */

const { createCanvas } = require('canvas')
const { outputCanvas, gridVis, textInfoVis } = require('./visTools')
const { measureTextSize, roundFun } = require('./utils')
var assert = require('assert');

const debugCanvas = createCanvas(900, 600)
const debugCtx = debugCanvas.getContext('2d')

function drawFillingWords(keywords, fillingWords, group, options) {
  const {
    width: canvasWidth,
    height: canvasHeight,
    fillingFontSize,
    angleMode,
    fontFamily,
    maxFontSize,
    minFontSize,
    fontWeight,
    fillingWordColor,
  } = options
  const gridSettings = {
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
    rotateRatio: 0.5,
    minRotation: -Math.PI / 2,
    maxRotation: Math.PI / 2,
    angleMode,
    fontWeight,
    fontFamily,
    fillingWordColor,
  }


  const wordLayouts = []
  gridSettings.rotationRange = Math.abs(gridSettings.maxRotation - gridSettings.minRotation)
  gridSettings.maxRadius = Math.floor(Math.sqrt(gridSettings.canvasWidth * gridSettings.canvasWidth + gridSettings.canvasHeight * gridSettings.canvasHeight) / 2)

  // 将canvas划分成格子，进行分布
  const grid = createGrid(keywords, group, gridSettings, options)
  // 多次填充，保证填充率
  let fontSize = fillingFontSize

  fillingWords.forEach(word => {
    putWord(word, fontSize, 0.8, grid, wordLayouts, gridSettings)
  })
  fillingWords.forEach(word => {
    putWord(word, fontSize, 0.8, grid, wordLayouts, gridSettings)
  })
  gridVis(grid)
  console.log(wordLayouts.length)

  fontSize -= 2
  fillingWords.forEach(word => {
    putWord(word, fontSize, 0.8, grid, wordLayouts, gridSettings)
  })
  fillingWords.forEach(word => {
    putWord(word, fontSize, 0.8, grid, wordLayouts, gridSettings)
  })
  gridVis(grid)
  console.log(wordLayouts.length)
  fontSize -= 3
  fillingWords.forEach(word => {
    putWord(word, fontSize, 0.8, grid, wordLayouts, gridSettings)
  })
  fillingWords.forEach(word => {
    putWord(word, fontSize, 0.8, grid, wordLayouts, gridSettings)
  })

  gridVis(grid)
  console.log(wordLayouts.length)
  fontSize -= 3
  fillingWords.forEach((word, index) => {
    putWord(word, fontSize, 0.7, grid, wordLayouts, gridSettings, index)
  })
  fillingWords.forEach(word => {
    putWord(word, fontSize, 0.7, grid, wordLayouts, gridSettings)
  })
  gridVis(grid)
  console.log(wordLayouts.length)



  // putWord(fillingWords[0], 1, 0.8, grid, wordLayouts, gridSettings)
  // outputCanvas(debugCanvas, 'debug')
  // gridVis(grid)
  // console.log(count1, count2, count1 / count2)

  return wordLayouts
}

function putWord(word, fontSize, alpha, grid, wordLayouts, gridSettings, index) {

  const { canvasWidth, canvasHeight, maxRadius, fillingWordColor } = gridSettings
  const rotateDeg = roundFun(getRotateDeg(gridSettings), 3)
  const wordPixels = getTextPixels(word, rotateDeg, fontSize, gridSettings)

  if (!wordPixels) return false

  let center = getRandomPosition()
  debugCtx.fillRect(center[0], center[1], 10, 10)

  // const max = 12000
  // for (let i = 0; i < max; i++) {
  //   const nudge = getSpiralPoint(i, max)
  //   center[0] += nudge[0] / 2
  //   center[1] += nudge[1] / 2
  //   center = [Math.round(center[0]), Math.round(center[1])]

  //   debugCtx.fillRect(center[0], center[1], 2, 2)

  //   // if (canPutWordAtPoint(grid, wordPixels, center[0], center[1])) {
  //   //   // 能放置则返回单词构建信息
  //   //   const info = drawWordInfo(word.name, center[0], center[1], fontSize, fillingWordColor, rotateDeg)
  //   //   info && wordLayouts.push(info)
  //   //   if (info && alpha == 0.7) {
  //   //     console.log(index, word, '-----------------')
  //   //     debugCtx.fillRect(center[0], center[1], 3, 3)
  //   //   }

  //   //   return true
  //   // }
  // }

  const gap = 2
  for (let x = 0; x < canvasWidth; x += gap) {
    for (let y = 0; y < canvasHeight; y += gap) {
      if (canPutWordAtPoint(grid, wordPixels, x, y)) {
        debugCtx.fillRect(x, y, 1, 1)
        const info = drawWordInfo(word.name, x, y, fontSize, fillingWordColor, rotateDeg)
        info && wordLayouts.push(info)
        return true
      }

    }
  }

  // outputCanvas(debugCanvas)
  return false


  function drawWordInfo(name, x, y, fontSize, color, rotateDeg) {
    return Math.floor(y) < canvasHeight && Math.floor(x) < canvasWidth ? {
      name,
      fontSize,
      color,
      angle: rotateDeg,
      x,
      y,
    } : undefined
  }

  function canPutWordAtPoint(grid, wordPixels, x, y) {
    // console.log(grid)
    // 遍历像素,看是否能放置

    for (let pixel of wordPixels) {
      let pX = x + pixel[0], pY = y + pixel[1]
      if (pX <= 0 || pY <= 0 || pX >= canvasWidth || pY >= canvasHeight)
        return false
      if (!grid[pX][pY]) {
        return false
      }
    }

    // 放置则更新grid
    wordPixels.forEach(pixel => {
      let pX = x + pixel[0], pY = y + pixel[1]
      grid[pX][pY] = false
    })

    return true
  }

  function getSpiralPoint(i, max) {
    // 获取螺旋线增量的方法
    const rad = powerMap(0.5, i, 0, max, 1, maxRadius)
    // const thetaIncrement = powerMap(1, i, 0, max, 0, 2 * Math.PI)
    const thetaIncrement = 2 * Math.PI / 360
    const theta = thetaIncrement * i
    const x = Math.cos(theta) * rad
    const y = Math.sin(theta) * rad
    return [x, y]
  }

  function powerMap(power, v, min1, max1, min2, max2) {
    // 映射
    const val = Math.pow(v / (max1 - min1), power)
    return (max2 - min2) * val + min2
  }

  function getRandomPosition() {
    const offset = 10
    const xMax = canvasWidth / 2 + 50, xMin = canvasWidth / 2 - 50
    const YMax = canvasHeight / 2 + 50, yMin = canvasHeight / 2 - 50

    const x = Math.round(Math.random() * (xMax - xMin + 1) + xMin)
    const y = Math.round(Math.random() * (YMax - yMin + 1) + yMin)

    return [x, y]
  }
}

function getTextPixels(word, rotateDeg, fontSize, gridSettings) {
  if (fontSize < 0)
    return false
  const { fontFamily, fontWeight } = gridSettings
  const { width, height, ascent, descent } = measureTextSize(word.name, fontSize, fontFamily)
  const canvasWidth = Math.max(width, height) * 2 + 20, canvasHeight = Math.max(width, height) * 2 + 20
  const x = canvasWidth / 2, y = canvasHeight / 2
  const wordPixels = []

  const wordCanvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = wordCanvas.getContext('2d')
  ctx.fillStyle = '#000000'
  ctx.translate(x, y)
  ctx.rotate(rotateDeg)
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#ff0000'
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.fillText(word.name, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data
  for (let imageX = 0; imageX < canvasWidth; imageX++) {
    for (let imageY = 0; imageY < canvasHeight; imageY++) {
      if (imageData[(imageY * canvasWidth + imageX) * 4] !== 0) {
        wordPixels.push([imageX - x, imageY - y])
      }
    }
  }
  return wordPixels
}

function createGrid(keywords, group, gridSettings) {
  const grid = []
  const { canvasWidth, canvasHeight, fontWeight } = gridSettings
  const isPointInShape = point => group[point.y][Math.floor(point.x)] >= 2
  const wordCanvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = wordCanvas.getContext('2d')


  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  keywords.forEach(word => {
    if (word.state) {
      const { name, position, fontFamily, angle, fontSize, width, height } = word
      const [x, y] = position

      ctx.save()
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.fillStyle = '#FF0000'
      ctx.translate(x - width / 2, y + height / 2)
      ctx.rotate(angle)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(name, 0, 0)
      ctx.restore()
    }
  })


  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data
  // 取背景像素
  const bgCtx = createCanvas(10, 10).getContext('2d')
  bgCtx.fillStyle = '#000000'
  bgCtx.fillRect(0, 0, 1, 1)
  const bgPixel = bgCtx.getImageData(0, 0, 1, 1).data


  let x = canvasWidth
  while (x--) {
    grid[x] = []
    let y = canvasHeight
    while (y--) {
      // 对格子内每个像素进行检测
      if ((imageData[(y * canvasWidth + x) * 4] !== bgPixel[0])
        || !isPointInShape({ x, y })) {
        grid[x][y] = false
      } else {
        grid[x][y] = true
      }
    }
  }
  return grid
}

function getRotateDeg(settings) {
  const { rotateRatio, angleMode, minRotation, maxRotation, rotationRange } = settings
  // 根据设定的filling word mode 去返回角度
  if (angleMode == 2) {
    return Math.random() * (maxRotation - minRotation + 1) + minRotation
  } else if (angleMode == 3) {
    return Math.PI / 4
  } else if (angleMode == 4) {
    return -Math.PI / 4
  } else if (angleMode == 5) {
    return Math.random() > 0.5 ? Math.PI / 4 : -Math.PI / 4
  } else {
    return Math.random() > rotateRatio ? 0 : minRotation + Math.floor(Math.random() * 2) * rotationRange
  }
}

module.exports = {
  drawFillingWords,
}
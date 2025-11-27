import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import treePng from '../assets/pngTree.png'

type Ornament = {
  id: string
  x: number
  y: number
  color: string
  radius: number
}

const CANVAS_SIZE = 700
const TREE_PADDING = 40
const TREE_CENTER_X = CANVAS_SIZE / 2
const TREE_BOTTOM = CANVAS_SIZE - 60
const TREE_TOP = TREE_PADDING
const treePathData = [
  'M235 581C219.656 632.181 215.206 662.267 213.5 718C263.969 747.953 291.998 747.097 341.5 718C340.754 664.441 337.099 634.453 327.5 581H235Z',
  'M74.9192 414C42.1335 467.395 26.5494 497.776 8.4192 553.5C-7.40931 583.527 -0.788567 589.712 39.9192 581.5C47.4921 621.421 62.8025 616.943 97.9192 590C110.069 649.626 124.155 655.291 166.419 600C182.271 671.295 197.256 669.074 232.419 606.5C270.606 672.911 290.968 668.23 325.919 606.5C358.756 665.99 373.91 665.238 394.919 600C436.059 652.598 449.998 649.422 459.919 590C494.016 621.27 507.829 620.948 520.919 581.5C543.791 598.196 549.108 594.551 545.419 565.5C529.812 503.349 516.727 469.14 487.419 409L74.9192 414Z',
  'M126.981 283H444.981C476.074 312.498 489.903 331.104 505.481 369.5C522.384 409.548 518.796 421.562 472.981 411.5C471.122 460.506 454.379 464.862 397.481 431C384.755 491.309 368.668 491.942 322.981 431C298.005 491.773 282.486 495.645 251.481 436C208.7 490.311 192.7 486.114 176.981 423C124.734 462.096 104.491 466.982 102.481 411.5C61.3397 422.418 53.2632 413.944 68.9814 369.5C85.3516 334.195 98.5876 315.389 126.981 283Z',
  'M225.19 127.012C268.309 72.5148 294.498 74.8231 344.19 127.012C386.317 170.387 406.488 197.01 438.69 247.012C463.374 291.24 457.752 298.717 416.69 284.512C432.737 325.309 419.816 327.11 362.19 297.012C359.874 355.009 349.485 357.633 316.19 314.012C286.594 355.416 271.378 371.247 260.19 314.012C215.807 357.259 202.209 356.053 203.19 297.012C148.122 326.993 136.572 323.65 147.69 284.512C109.419 290.68 101.5 284.577 128.19 247.012C161.938 196.228 182.415 169.232 225.19 127.012Z',
  'M280.891 23.4164C283.286 16.0459 293.713 16.0459 296.108 23.4164L304.44 49.0598C305.511 52.356 308.583 54.5877 312.048 54.5877L339.012 54.5877C346.761 54.5877 349.983 64.5046 343.714 69.0598L321.9 84.9083C319.096 86.9454 317.923 90.5564 318.994 93.8525L327.326 119.496C329.721 126.866 321.285 132.995 315.015 128.44L293.202 112.592C290.398 110.555 286.601 110.555 283.797 112.592L261.984 128.44C255.714 132.995 247.278 126.866 249.673 119.496L258.005 93.8525C259.076 90.5564 257.903 86.9454 255.099 84.9083L233.285 69.0598C227.016 64.5046 230.238 54.5877 237.988 54.5877L264.951 54.5877C268.416 54.5877 271.488 52.356 272.559 49.0598L280.891 23.4164Z',
]

function HomeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)
  const treeImageRef = useRef<HTMLImageElement | null>(null)
  const treePathsRef = useRef<Path2D[]>([])
  const treeTransformRef = useRef<{ offsetX: number; offsetY: number; scale: number } | null>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const draggedIdRef = useRef<string | null>(null)

  const [ornaments, setOrnaments] = useState<Ornament[]>([
    { id: 'ornament-1', x: TREE_CENTER_X - 40, y: TREE_TOP + 160, color: '#F87171', radius: 16 },
    { id: 'ornament-2', x: TREE_CENTER_X + 50, y: TREE_TOP + 260, color: '#60A5FA', radius: 16 },
  ])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // 고해상도 디스플레이 대응
    const dpr = window.devicePixelRatio || 1
    
    // 캔버스의 실제 해상도를 devicePixelRatio에 맞춰 설정
    canvas.width = CANVAS_SIZE * dpr
    canvas.height = CANVAS_SIZE * dpr
    
    // CSS 크기는 원래대로 유지
    canvas.style.width = `${CANVAS_SIZE}px`
    canvas.style.height = `${CANVAS_SIZE}px`
    
    const context = canvas.getContext('2d')
    if (!context) return
    
    // 컨텍스트 스케일 조정 (모든 그리기 작업이 고해상도로 이루어지도록)
    context.scale(dpr, dpr)
    ctx.current = context

    const img = new Image()
    img.src = treePng
    img.onload = () => {
      treeImageRef.current = img
      treePathsRef.current = treePathData.map((path) => new Path2D(path))
      drawScene()
    }
  }, [])

  useEffect(() => {
    drawScene()
  }, [ornaments])

  const drawScene = () => {
    const canvas = canvasRef.current
    const context = ctx.current
    if (!canvas || !context) return
    context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    drawTreeImage(context)
    ornaments.forEach((ornament) => drawOrnament(context, ornament))
  }

  const drawTreeImage = (context: CanvasRenderingContext2D) => {
    const treeImage = treeImageRef.current
    if (!treeImage) return
    const targetHeight = TREE_BOTTOM - (TREE_TOP - 20)
    const scale = targetHeight / treeImage.height
    const drawWidth = treeImage.width * scale
    const drawHeight = treeImage.height * scale
    const offsetX = (CANVAS_SIZE - drawWidth) / 2
    const offsetY = TREE_TOP - 20
    treeTransformRef.current = { offsetX, offsetY, scale }
    context.drawImage(treeImage, offsetX, offsetY, drawWidth, drawHeight)
  }

  const canvasToSvgPoint = (canvasX: number, canvasY: number) => {
    const transform = treeTransformRef.current
    if (!transform || transform.scale === 0) return null
    return {
      x: (canvasX - transform.offsetX) / transform.scale,
      y: (canvasY - transform.offsetY) / transform.scale,
    }
  }

  const isPointInsideTree = (canvasX: number, canvasY: number) => {
    const context = ctx.current
    const svgPoint = canvasToSvgPoint(canvasX, canvasY)
    if (!context || !svgPoint || treePathsRef.current.length === 0) return false
    return treePathsRef.current.some((path) => context.isPointInPath(path, svgPoint.x, svgPoint.y))
  }

  const constrainToTree = (x: number, y: number, fallback: Ornament) => {
    if (!treeImageRef.current || treePathsRef.current.length === 0 || !treeTransformRef.current) {
      return { x, y }
    }
    if (isPointInsideTree(x, y)) return { x, y }

    const centerX = TREE_CENTER_X
    const centerY = TREE_TOP + (TREE_BOTTOM - TREE_TOP) / 2
    let testX = x
    let testY = y

    for (let i = 0; i < 40; i++) {
      testX += (centerX - testX) * 0.2
      testY += (centerY - testY) * 0.2
      if (isPointInsideTree(testX, testY)) {
        return { x: testX, y: testY }
      }
    }

    return { x: fallback.x, y: fallback.y }
  }

  const drawOrnament = (context: CanvasRenderingContext2D, ornament: Ornament) => {
    context.beginPath()
    context.arc(ornament.x, ornament.y, ornament.radius, 0, Math.PI * 2)
    context.fillStyle = ornament.color
    context.fill()
    context.strokeStyle = 'rgba(255,255,255,0.25)'
    context.lineWidth = 2
    context.stroke()
  }

  const canvasPointFromEvent = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const pickOrnament = (x: number, y: number) => {
    for (let i = ornaments.length - 1; i >= 0; i--) {
      const candidate = ornaments[i]
      const dx = x - candidate.x
      const dy = y - candidate.y
      if (Math.sqrt(dx * dx + dy * dy) <= candidate.radius + 2) {
        return candidate
      }
    }
    return null
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = canvasPointFromEvent(event)
    const target = pickOrnament(x, y)
    if (!target) return
    draggedIdRef.current = target.id
    dragOffsetRef.current = { x: x - target.x, y: y - target.y }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const draggedId = draggedIdRef.current
    if (!draggedId) return
    const { x, y } = canvasPointFromEvent(event)

    setOrnaments((prev) =>
      prev.map((ornament) => {
        if (ornament.id !== draggedId) return ornament
        const proposedX = x - dragOffsetRef.current.x
        const proposedY = y - dragOffsetRef.current.y
        const constrained = constrainToTree(proposedX, proposedY, ornament)
        return { ...ornament, ...constrained }
      })
    )
  }

  const handleMouseUp = () => {
    draggedIdRef.current = null
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="drop-shadow-2xl bg-transparent pointer-events-auto"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: HomeCanvas,
})
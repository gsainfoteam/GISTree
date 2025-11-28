import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import treePng from '../assets/pngTree.png'

// --- [fe] HomeCanvas 관련 로직 및 타입 정의 시작 ---
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

function HomeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)
  const treeImageRef = useRef<HTMLImageElement | null>(null)
  const treeImageDataRef = useRef<ImageData | null>(null)
  const treeTransformRef = useRef<{ offsetX: number; offsetY: number; scale: number; drawWidth: number; drawHeight: number } | null>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const draggedIdRef = useRef<string | null>(null)

  const [ornaments, setOrnaments] = useState<Ornament[]>([
    { id: 'ornament-1', x: TREE_CENTER_X - 40, y: TREE_TOP + 160, color: '#F87171', radius: 16 },
    { id: 'ornament-2', x: TREE_CENTER_X + 50, y: TREE_TOP + 260, color: '#60A5FA', radius: 16 },
  ])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const dpr = window.devicePixelRatio || 1
    canvas.width = CANVAS_SIZE * dpr
    canvas.height = CANVAS_SIZE * dpr
    canvas.style.width = `${CANVAS_SIZE}px`
    canvas.style.height = `${CANVAS_SIZE}px`
    
    const context = canvas.getContext('2d')
    if (!context) return
    
    context.scale(dpr, dpr)
    ctx.current = context

    const img = new Image()
    img.src = treePng
    img.onload = () => {
      treeImageRef.current = img
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = img.width
      tempCanvas.height = img.height
      const tempCtx = tempCanvas.getContext('2d')
      if (tempCtx) {
        tempCtx.drawImage(img, 0, 0)
        treeImageDataRef.current = tempCtx.getImageData(0, 0, img.width, img.height)
      }
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
    treeTransformRef.current = { offsetX, offsetY, scale, drawWidth, drawHeight }
    context.drawImage(treeImage, offsetX, offsetY, drawWidth, drawHeight)
  }

  const canvasToImagePoint = (canvasX: number, canvasY: number) => {
    const transform = treeTransformRef.current
    if (!transform || transform.scale === 0) return null
    const imageX = Math.floor((canvasX - transform.offsetX) / transform.scale)
    const imageY = Math.floor((canvasY - transform.offsetY) / transform.scale)
    return { x: imageX, y: imageY }
  }

  const isPointInsideTree = (canvasX: number, canvasY: number) => {
    const imageData = treeImageDataRef.current
    const transform = treeTransformRef.current
    if (!imageData || !transform) return false
    
    const imagePoint = canvasToImagePoint(canvasX, canvasY)
    if (!imagePoint) return false
    
    if (imagePoint.x < 0 || imagePoint.x >= imageData.width || 
        imagePoint.y < 0 || imagePoint.y >= imageData.height) {
      return false
    }
    
    const index = (imagePoint.y * imageData.width + imagePoint.x) * 4
    const alpha = imageData.data[index + 3]
    return alpha > 128
  }

  const constrainToTree = (x: number, y: number, fallback: Ornament) => {
    if (!treeImageRef.current || !treeImageDataRef.current || !treeTransformRef.current) {
      return { x, y }
    }
    if (isPointInsideTree(x, y)) return { x, y }

    const searchRadius = 50
    const angleSteps = 64
    let closestPoint: { x: number; y: number; distance: number } | null = null

    for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / angleSteps) {
      for (let radius = 1; radius <= searchRadius; radius += 1) {
        const testX = x + Math.cos(angle) * radius
        const testY = y + Math.sin(angle) * radius
        
        if (isPointInsideTree(testX, testY)) {
          const distance = Math.sqrt((testX - x) ** 2 + (testY - y) ** 2)
          if (!closestPoint || distance < closestPoint.distance) {
            closestPoint = { x: testX, y: testY, distance }
          }
          break
        }
      }
    }

    if (closestPoint) return { x: closestPoint.x, y: closestPoint.y }

    const centerX = TREE_CENTER_X
    const centerY = TREE_TOP + (TREE_BOTTOM - TREE_TOP) / 2
    let testX = x
    let testY = y

    for (let i = 0; i < 60; i++) {
      testX += (centerX - testX) * 0.02
      testY += (centerY - testY) * 0.02
      if (isPointInsideTree(testX, testY)) return { x: testX, y: testY }
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
// --- [fe] HomeCanvas 끝 ---


// --- [main] Route 및 Home 컴포넌트 (Auth 로직 포함) ---
export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { user, isLoading } = useAuth()

  const handleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL;
    if (!backendUrl) {
      console.error('VITE_API_BASE_URL is not defined');
      return;
    }
    const redirectUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `${backendUrl}/auth/login?redirect_url=${redirectUrl}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A472A]"></div>
      </div>
    )
  }

  // 로그인하지 않은 경우: [main]의 랜딩 페이지 디자인 유지
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 relative overflow-hidden bg-[#F8F9FA]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1A472A] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C41E3A] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-[#D4AF37] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="mb-6 inline-block animate-bounce-slow">
            <span className="text-7xl filter drop-shadow-lg">🎄</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6 text-[#1A472A] tracking-tight drop-shadow-sm">
            GISTree
          </h1>
          <p className="text-xl md:text-3xl mb-12 text-[#2C3E50] leading-relaxed font-light font-serif">
            Share warmth and joy with your GIST friends.<br />
            <span className="text-[#C41E3A] font-medium">Plant a message, grow a memory.</span>
          </p>
          <button
            onClick={handleLogin}
            className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white transition-all duration-300 bg-[#C41E3A] rounded-full hover:bg-[#A01830] focus:outline-none focus:ring-4 focus:ring-[#C41E3A]/30 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            <span className="relative flex items-center gap-3">
              Login with GIST IdP
              <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    )
  }

  // 로그인한 경우: [fe]의 HomeCanvas(트리 꾸미기) 렌더링
  return <HomeCanvas />
}
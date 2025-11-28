import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import treePng from '../assets/pngTree.png'

// 장식품(ornament)의 타입을 정의합니다
type Ornament = {
  id: string        // 장식품의 고유 식별자
  x: number         // 캔버스에서의 x 좌표
  y: number         // 캔버스에서의 y 좌표
  color: string     // 장식품의 색상 (예: '#F87171')
  radius: number    // 장식품의 반지름 (원의 크기)
}

// 캔버스의 크기를 700픽셀로 설정합니다
const CANVAS_SIZE = 700
// 트리 이미지 주변 여백을 40픽셀로 설정합니다
const TREE_PADDING = 40
// 트리의 중심 x 좌표를 계산합니다 (캔버스 가로 중앙)
const TREE_CENTER_X = CANVAS_SIZE / 2
// 트리의 하단 y 좌표를 계산합니다 (캔버스 하단에서 60픽셀 위)
const TREE_BOTTOM = CANVAS_SIZE - 60
// 트리의 상단 y 좌표를 계산합니다 (패딩만큼 아래)
const TREE_TOP = TREE_PADDING
// 주석: 이전에는 SVG path data를 사용했지만, PNG 이미지를 사용하므로
// 픽셀 데이터를 직접 읽는 방식으로 변경합니다.
// path data는 더 이상 사용하지 않습니다.

function HomeCanvas() {
  // useRef: 컴포넌트가 리렌더링되어도 값이 유지되는 참조를 만듭니다
  // canvasRef: 실제 HTML canvas 요소를 참조합니다 (DOM에 접근하기 위해 필요)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // ctx: canvas의 2D 렌더링 컨텍스트를 저장합니다 (그리기 작업을 수행하는 객체)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)
  // treeImageRef: 로드된 트리 이미지를 저장합니다
  const treeImageRef = useRef<HTMLImageElement | null>(null)
  // treeImageDataRef: 트리 이미지의 픽셀 데이터를 저장합니다 (트리 영역 판단용)
  // ImageData 객체를 저장하여 특정 좌표의 픽셀이 투명한지 확인할 수 있습니다
  const treeImageDataRef = useRef<ImageData | null>(null)
  // treeTransformRef: 트리 이미지의 위치와 크기 정보를 저장합니다 (좌표 변환에 필요)
  const treeTransformRef = useRef<{ offsetX: number; offsetY: number; scale: number; drawWidth: number; drawHeight: number } | null>(null)
  // dragOffsetRef: 드래그 시작 시 마우스와 장식품 중심 사이의 거리를 저장합니다
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  // draggedIdRef: 현재 드래그 중인 장식품의 ID를 저장합니다
  const draggedIdRef = useRef<string | null>(null)

  // useState: 장식품들의 상태를 관리합니다 (초기값으로 2개의 장식품을 설정)
  const [ornaments, setOrnaments] = useState<Ornament[]>([
    { id: 'ornament-1', x: TREE_CENTER_X - 40, y: TREE_TOP + 160, color: '#F87171', radius: 16 },
    { id: 'ornament-2', x: TREE_CENTER_X + 50, y: TREE_TOP + 260, color: '#60A5FA', radius: 16 },
  ])

  // useEffect: 컴포넌트가 마운트될 때 한 번만 실행됩니다 (의존성 배열이 빈 배열)
  useEffect(() => {
    // canvasRef를 통해 실제 canvas DOM 요소를 가져옵니다
    const canvas = canvasRef.current
    // canvas가 없으면 함수를 종료합니다 (안전성 체크)
    if (!canvas) return
    
    // 고해상도 디스플레이 대응
    // devicePixelRatio: 화면의 픽셀 밀도를 나타냅니다 (예: Retina 디스플레이는 2)
    // 고해상도 화면에서 선명한 이미지를 위해 필요합니다
    const dpr = window.devicePixelRatio || 1
    
    // 캔버스의 실제 해상도를 devicePixelRatio에 맞춰 설정합니다
    // 예: dpr가 2면 실제로는 1400x1400 픽셀로 그려집니다
    canvas.width = CANVAS_SIZE * dpr
    canvas.height = CANVAS_SIZE * dpr
    
    // CSS 크기는 원래대로 유지합니다 (화면에 표시되는 크기는 700x700)
    // 이렇게 하면 고해상도로 그려지지만 화면 크기는 동일하게 유지됩니다
    canvas.style.width = `${CANVAS_SIZE}px`
    canvas.style.height = `${CANVAS_SIZE}px`
    
    // canvas의 2D 렌더링 컨텍스트를 가져옵니다
    // 이 컨텍스트를 통해 선, 원, 이미지 등을 그릴 수 있습니다
    const context = canvas.getContext('2d')
    // 컨텍스트를 가져오지 못하면 함수를 종료합니다
    if (!context) return
    
    // 컨텍스트 스케일을 조정합니다 (모든 그리기 작업이 고해상도로 이루어지도록)
    // 예: dpr가 2면 모든 좌표가 2배로 확대되어 그려집니다
    context.scale(dpr, dpr)
    // 가져온 컨텍스트를 ref에 저장합니다 (다른 함수에서 사용하기 위해)
    ctx.current = context

    // 새로운 Image 객체를 생성합니다 (트리 이미지를 로드하기 위해)
    const img = new Image()
    img.src = treePng //treePng는 위에서 import함.
    img.onload = () => { //이미지가 로드되면
      treeImageRef.current = img
      // 임시 캔버스를 생성하여 이미지의 픽셀 데이터를 추출합니다
      // 이렇게 하면 PNG 이미지의 실제 픽셀 정보를 얻을 수 있습니다
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = img.width
      tempCanvas.height = img.height
      const tempCtx = tempCanvas.getContext('2d')
      if (tempCtx) {
        // 임시 캔버스에 이미지를 그립니다
        tempCtx.drawImage(img, 0, 0)
        // getImageData: 캔버스의 픽셀 데이터를 가져옵니다
        // 이 데이터에는 각 픽셀의 RGBA 값이 포함되어 있습니다
        treeImageDataRef.current = tempCtx.getImageData(0, 0, img.width, img.height)
      }
      drawScene() //그리기 함수. 아래서 정의함
    }
  }, []) // 빈 배열: 컴포넌트 마운트 시 한 번만 실행

  // ornaments 상태가 변경될 때마다 장면을 다시 그립니다
  useEffect(() => {
    drawScene()
  }, [ornaments]) // ornaments가 변경될 때마다 실행

  // drawScene함수 선언
  const drawScene = () => {
    const canvas = canvasRef.current
    const context = ctx.current
    // 둘 중 하나라도 없으면 함수를 종료합니다
    if (!canvas || !context) return
    // 캔버스를 지웁니다 (이전에 그려진 내용을 제거)
    context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE) // clearRect: 지정된 영역을 투명하게 만듭니다
    drawTreeImage(context) //트리 이미지 그리기 함수. 아래서 정의함
    //화살표함수. (매개변수) => {실행할 코드}
    ornaments.forEach((ornament) => drawOrnament(context, ornament))
  }

  const drawTreeImage = (context: CanvasRenderingContext2D) => {
    const treeImage = treeImageRef.current
    if (!treeImage) return // 이미지가 없으면 함수를 종료합니다
    // 트리를 그릴 목표 높이를 계산합니다 (하단 - 상단)
    const targetHeight = TREE_BOTTOM - (TREE_TOP - 20)
    // 이미지를 목표 높이에 맞추기 위한 스케일 비율을 계산합니다
    const scale = targetHeight / treeImage.height
    // 스케일을 적용한 실제 그려질 너비를 계산합니다
    const drawWidth = treeImage.width * scale
    // 스케일을 적용한 실제 그려질 높이를 계산합니다
    const drawHeight = treeImage.height * scale
    // 이미지를 가로 중앙에 배치하기 위한 x 오프셋을 계산합니다
    const offsetX = (CANVAS_SIZE - drawWidth) / 2
    // 이미지를 세로 상단에 배치하기 위한 y 오프셋을 계산합니다
    const offsetY = TREE_TOP - 20
    // 트리의 변환 정보를 저장합니다 (나중에 좌표 변환에 사용)
    // drawWidth와 drawHeight도 저장하여 픽셀 데이터 접근 시 사용합니다
    treeTransformRef.current = { offsetX, offsetY, scale, drawWidth, drawHeight }
    // drawImage: 이미지를 캔버스에 그립니다
    // drawImage(image, x, y, width, height)
    context.drawImage(treeImage, offsetX, offsetY, drawWidth, drawHeight)
  }

  // 캔버스 좌표를 원본 이미지 좌표로 변환하는 함수입니다
  // (트리 이미지가 스케일되어 그려졌기 때문에 좌표 변환이 필요합니다)
  const canvasToImagePoint = (canvasX: number, canvasY: number) => {
    // 저장된 트리 변환 정보를 가져옵니다
    const transform = treeTransformRef.current
    // 변환 정보가 없거나 스케일이 0이면 null을 반환합니다
    if (!transform || transform.scale === 0) return null
    // 캔버스 좌표를 원본 이미지 좌표로 변환합니다
    // 오프셋을 빼고 스케일로 나누어 원본 크기 기준 좌표를 얻습니다
    const imageX = Math.floor((canvasX - transform.offsetX) / transform.scale)
    const imageY = Math.floor((canvasY - transform.offsetY) / transform.scale)
    return { x: imageX, y: imageY }
  }

  // 특정 좌표가 트리 안에 있는지 판단하는 함수(insPointInsideTree)함수 선언
  // PNG 이미지의 픽셀 데이터를 직접 읽어서 투명도(알파값)를 확인합니다
  const isPointInsideTree = (canvasX: number, canvasY: number) => {
    // 픽셀 데이터와 변환 정보를 가져옵니다
    const imageData = treeImageDataRef.current
    const transform = treeTransformRef.current
    // 둘 중 하나라도 없으면 false를 반환합니다
    if (!imageData || !transform) return false
    
    // 캔버스 좌표를 원본 이미지 좌표로 변환합니다
    const imagePoint = canvasToImagePoint(canvasX, canvasY)
    if (!imagePoint) return false
    
    // 변환된 좌표가 이미지 범위를 벗어나면 false를 반환합니다
    if (imagePoint.x < 0 || imagePoint.x >= imageData.width || 
        imagePoint.y < 0 || imagePoint.y >= imageData.height) {
      return false
    }
    
    // ImageData의 data 배열에서 해당 픽셀의 인덱스를 계산합니다
    // 각 픽셀은 4개의 값(R, G, B, A)을 가지므로 인덱스는 (y * width + x) * 4입니다
    const index = (imagePoint.y * imageData.width + imagePoint.x) * 4
    // 알파값(투명도)을 가져옵니다 (인덱스 + 3이 알파 채널)
    const alpha = imageData.data[index + 3]
    
    // 알파값이 0보다 크면 픽셀이 투명하지 않으므로 트리 안에 있다고 판단합니다
    // 일반적으로 알파값이 128 이상이면 충분히 불투명하다고 봅니다
    return alpha > 128
  }

  // 장식품의 위치를 트리 안으로 제한하는 함수(constrainToTree)함수 선언
  const constrainToTree = (x: number, y: number, fallback: Ornament) => {
    // 필요한 데이터가 없으면 원래 좌표를 그대로 반환합니다
    if (!treeImageRef.current || !treeImageDataRef.current || !treeTransformRef.current) {
      return { x, y }
    }
    // 좌표가 이미 트리 안에 있으면 그대로 반환합니다
    if (isPointInsideTree(x, y)) return { x, y }

    // 현재 위치에서 가장 가까운 트리 경계를 찾는 방법
    // 1단계: 현재 위치 주변을 원형으로 탐색하여 가장 가까운 트리 안의 점 찾기
    const searchRadius = 50 // 탐색 반경 (픽셀)
    const angleSteps = 64 // 64방향으로 탐색
    let closestPoint: { x: number; y: number; distance: number } | null = null

    // 현재 위치에서 여러 방향으로 탐색
    for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / angleSteps) {
      // 반경을 점진적으로 늘려가며 탐색
      for (let radius = 1; radius <= searchRadius; radius += 1) {
        const testX = x + Math.cos(angle) * radius
        const testY = y + Math.sin(angle) * radius
        
        // 트리 안에 있는지 확인
        if (isPointInsideTree(testX, testY)) {
          const distance = Math.sqrt((testX - x) ** 2 + (testY - y) ** 2)
          // 가장 가까운 점을 저장
          if (!closestPoint || distance < closestPoint.distance) {
            closestPoint = { x: testX, y: testY, distance }
          }
          break // 이 방향에서는 더 멀리 갈 필요 없음
        }
      }
    }

    // 가장 가까운 점을 찾았으면 반환
    if (closestPoint) {
      return { x: closestPoint.x, y: closestPoint.y }
    }

    // 탐색으로 찾지 못한 경우: 트리 중심 방향으로 부드럽게 이동
    const centerX = TREE_CENTER_X
    const centerY = TREE_TOP + (TREE_BOTTOM - TREE_TOP) / 2
    let testX = x
    let testY = y

    // 이동 비율을 줄여서 더 부드럽게 이동 (2% -> 0.02)
    for (let i = 0; i < 60; i++) {
      // 현재 좌표를 트리 중심 방향으로 2%씩 이동시킵니다 (더 부드러움)
      testX += (centerX - testX) * 0.02
      testY += (centerY - testY) * 0.02
      // 이동한 좌표가 트리 안에 있으면 그 좌표를 반환합니다
      if (isPointInsideTree(testX, testY)) {
        return { x: testX, y: testY }
      }
    }
    // 모든 시도가 실패하면 원래 위치(fallback)를 반환합니다
    return { x: fallback.x, y: fallback.y }
  }

  // 장식품을 캔버스에 그리는 함수(drawOrnament)함수 선언. 여기 나중에 파일 불러와서 쓸거
  const drawOrnament = (context: CanvasRenderingContext2D, ornament: Ornament) => {
    // 새로운 경로를 시작합니다 (그리기 작업의 시작을 알립니다)
    context.beginPath()
    // arc(): 원을 그리는 함수
    // arc(x, y, radius, startAngle, endAngle)
    // x, y: 원의 중심 좌표
    // radius: 반지름
    // 0: 시작 각도 (0도 = 오른쪽)
    // Math.PI * 2: 끝 각도 (360도 = 한 바퀴)
    context.arc(ornament.x, ornament.y, ornament.radius, 0, Math.PI * 2)
    // fillStyle: 채우기 색상을 설정합니다
    context.fillStyle = ornament.color
    // fill(): 경로를 색상으로 채웁니다 (원의 내부를 칠합니다)
    context.fill()
    // strokeStyle: 테두리 색상을 설정합니다 (반투명 흰색)
    context.strokeStyle = 'rgba(255,255,255,0.25)'
    // lineWidth: 테두리 두께를 설정합니다
    context.lineWidth = 2
    // stroke(): 경로의 테두리를 그립니다 (원의 둘레를 그립니다)
    context.stroke()
  }

  // 마우스 이벤트에서 캔버스 좌표를 계산하는 함수(canvasPointFromEvent)함수 선언
  // (브라우저 좌표를 캔버스 내부 좌표로 변환합니다)
  const canvasPointFromEvent = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // getBoundingClientRect(): canvas 요소의 화면상 위치와 크기를 가져옴
    const rect = canvasRef.current?.getBoundingClientRect()
    // 위치 정보를 가져오지 못하면 (0, 0)을 반환합니다
    if (!rect) return { x: 0, y: 0 }
    // 마우스의 화면 좌표에서 canvas의 시작 위치를 빼서
    // canvas 내부의 상대 좌표를 계산합니다
    return {
      x: event.clientX - rect.left,  // clientX: 마우스의 화면상 x 좌표
      y: event.clientY - rect.top,  // clientY: 마우스의 화면상 y 좌표
    }
  }

  // 특정 좌표에서 클릭된 장식품을 찾는 함수(pickOrnament)함수 선언
  const pickOrnament = (x: number, y: number) => {
    // 배열을 뒤에서부터 순회합니다 (위에 그려진 장식품을 먼저 선택하기 위해)
    for (let i = ornaments.length - 1; i >= 0; i--) {
      // 현재 확인할 장식품을 가져옵니다
      const candidate = ornaments[i]
      // 클릭한 위치와 장식품 중심 사이의 x 거리를 계산합니다
      const dx = x - candidate.x
      // 클릭한 위치와 장식품 중심 사이의 y 거리를 계산합니다
      const dy = y - candidate.y
      // 피타고라스 정리를 사용하여 실제 거리를 계산합니다
      // Math.sqrt(dx * dx + dy * dy): 두 점 사이의 직선 거리
      // candidate.radius + 2: 장식품 반지름 + 여유 공간 (클릭하기 쉽게)
      // 거리가 반지름 이내이면 해당 장식품을 반환합니다
      if (Math.sqrt(dx * dx + dy * dy) <= candidate.radius + 2) {
        return candidate
      }
    }
    // 아무 장식품도 클릭되지 않았으면 null을 반환합니다
    return null
  }

  // 마우스를 누를 때 실행되는 함수입니다
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // 이벤트에서 캔버스 좌표를 계산합니다
    const { x, y } = canvasPointFromEvent(event)
    // 클릭한 위치의 장식품을 찾습니다
    const target = pickOrnament(x, y)
    // 장식품이 클릭되지 않았으면 함수를 종료합니다
    if (!target) return
    // 드래그 중인 장식품의 ID를 저장합니다
    draggedIdRef.current = target.id
    // 마우스 위치와 장식품 중심 사이의 오프셋을 저장합니다
    // 이렇게 하면 마우스를 장식품의 가장자리에서 잡아도 자연스럽게 드래그됩니다
    dragOffsetRef.current = { x: x - target.x, y: y - target.y }
  }

  // 마우스를 움직일 때 실행되는 함수입니다
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // 현재 드래그 중인 장식품의 ID를 가져옵니다
    const draggedId = draggedIdRef.current
    // 드래그 중인 장식품이 없으면 함수를 종료합니다
    if (!draggedId) return
    // 이벤트에서 캔버스 좌표를 계산합니다
    const { x, y } = canvasPointFromEvent(event)

    // ornaments 상태를 업데이트합니다
    setOrnaments((prev) =>
      // prev 배열의 각 장식품을 확인합니다
      prev.map((ornament) => {
        // 현재 장식품이 드래그 중인 장식품이 아니면 그대로 반환합니다
        if (ornament.id !== draggedId) return ornament
        // 마우스 위치에서 오프셋을 빼서 장식품의 새로운 중심 위치를 계산합니다
        const proposedX = x - dragOffsetRef.current.x
        const proposedY = y - dragOffsetRef.current.y
        // 제안된 위치를 트리 안으로 제한합니다
        const constrained = constrainToTree(proposedX, proposedY, ornament)
        // 장식품의 위치를 업데이트합니다 (기존 속성은 유지하고 위치만 변경)
        return { ...ornament, ...constrained }
      })
    )
  }

  // 마우스를 뗄 때 실행되는 함수입니다
  const handleMouseUp = () => {
    // 드래그 상태를 해제합니다 (더 이상 드래그 중이 아님)
    draggedIdRef.current = null
  }

  // 컴포넌트가 렌더링할 JSX를 반환합니다
  return (
    // fixed: 화면에 고정된 위치에 배치합니다
    // inset-0: 화면 전체를 차지합니다 (top:0, right:0, bottom:0, left:0)
    // flex: flexbox 레이아웃을 사용합니다
    // items-center: 세로 중앙 정렬
    // justify-center: 가로 중앙 정렬
    // pointer-events-none: 이 div는 마우스 이벤트를 받지 않습니다 (자식 요소로 전달)
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      {/* canvas 요소: 그래픽을 그릴 수 있는 HTML 요소입니다 */}
      <canvas
        // ref: canvas DOM 요소에 대한 참조를 저장합니다
        ref={canvasRef}
        // width: canvas의 기본 너비 (실제로는 useEffect에서 dpr을 곱한 값으로 설정됨)
        width={CANVAS_SIZE}
        // height: canvas의 기본 높이
        height={CANVAS_SIZE}
        // className: CSS 클래스를 적용합니다
        // drop-shadow-2xl: 그림자 효과
        // bg-transparent: 배경을 투명하게
        // pointer-events-auto: 마우스 이벤트를 받습니다 (부모의 pointer-events-none을 무시)
        className="drop-shadow-2xl bg-transparent pointer-events-auto"
        // onMouseDown: 마우스를 누를 때 실행되는 함수
        onMouseDown={handleMouseDown}
        // onMouseMove: 마우스를 움직일 때 실행되는 함수
        onMouseMove={handleMouseMove}
        // onMouseUp: 마우스를 뗄 때 실행되는 함수
        onMouseUp={handleMouseUp}
        // onMouseLeave: 마우스가 canvas 영역을 벗어날 때 실행되는 함수 (드래그 종료)
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: HomeCanvas,
})
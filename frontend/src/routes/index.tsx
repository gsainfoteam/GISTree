//홈 화면
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import treeSvg from '../assets/Tree.svg' // 트리 그림이 들어 있는 SVG 파일을 불러옵니다. 빌드 시 URL 문자열로 변환됨

// 오너먼트(트리에 걸리는 장식) 하나를 표현하는 타입(형태)을 정의합니다.
type Ornament = {
  id: string // 고유 식별자 (각 오너먼트를 구분하기 위한 문자열)
  x: number // 캔버스 내 X 좌표 (왼쪽에서 얼마나 떨어져 있는지)
  y: number // 캔버스 내 Y 좌표 (위에서 얼마나 떨어져 있는지)
  color: string // 오너먼트의 채우기 색상 (예: '#F87171')
  radius: number // 오너먼트의 반지름(픽셀 단위 크기)
}

// 캔버스의 폭과 높이를 동일하게 600픽셀로 사용합니다.
const CANVAS_SIZE = 600 // 정사각형 캔버스 한 변 길이
// 트리 윗부분을 화면 맨 위에서 조금 띄우기 위한 여백 값입니다.
const TREE_PADDING = 60 // 트리 상단과 캔버스 상단 사이의 간격
// 트리는 화면 가운데에 위치시키고 싶으므로, 캔버스 가로 길이의 절반을 X 중심으로 사용합니다.
const TREE_CENTER_X = CANVAS_SIZE / 2 // 트리 중심 X 좌표 (캔버스 가로 중앙)
// 트리 아랫부분(눈밭 시작점)이 캔버스 하단보다 조금 위에 오도록 Y 좌표를 잡습니다.
const TREE_BOTTOM = CANVAS_SIZE - 80 // 트리 바닥 Y 좌표 (눈밭 바로 위)
// 트리의 꼭대기 Y 좌표는 위에서 정의한 패딩과 동일하게 사용합니다.
const TREE_TOP = TREE_PADDING // 트리 꼭대기 Y 좌표 (캔버스 상단에서 살짝 아래)

// SVG 내부에 있는 각 <path> 태그의 d 속성 값을 그대로 모아둔 배열입니다.
// 이 문자열 하나가 곧 "트리의 일부 모양"을 나타내는 벡터 경로입니다.
const treePathData = [
  'M235 581C219.656 632.181 215.206 662.267 213.5 718C263.969 747.953 291.998 747.097 341.5 718C340.754 664.441 337.099 634.453 327.5 581H235Z',
  'M74.9192 414C42.1335 467.395 26.5494 497.776 8.4192 553.5C-7.40931 583.527 -0.788567 589.712 39.9192 581.5C47.4921 621.421 62.8025 616.943 97.9192 590C110.069 649.626 124.155 655.291 166.419 600C182.271 671.295 197.256 669.074 232.419 606.5C270.606 672.911 290.968 668.23 325.919 606.5C358.756 665.99 373.91 665.238 394.919 600C436.059 652.598 449.998 649.422 459.919 590C494.016 621.27 507.829 620.948 520.919 581.5C543.791 598.196 549.108 594.551 545.419 565.5C529.812 503.349 516.727 469.14 487.419 409L74.9192 414Z',
  'M126.981 283H444.981C476.074 312.498 489.903 331.104 505.481 369.5C522.384 409.548 518.796 421.562 472.981 411.5C471.122 460.506 454.379 464.862 397.481 431C384.755 491.309 368.668 491.942 322.981 431C298.005 491.773 282.486 495.645 251.481 436C208.7 490.311 192.7 486.114 176.981 423C124.734 462.096 104.491 466.982 102.481 411.5C61.3397 422.418 53.2632 413.944 68.9814 369.5C85.3516 334.195 98.5876 315.389 126.981 283Z',
  'M225.19 127.012C268.309 72.5148 294.498 74.8231 344.19 127.012C386.317 170.387 406.488 197.01 438.69 247.012C463.374 291.24 457.752 298.717 416.69 284.512C432.737 325.309 419.816 327.11 362.19 297.012C359.874 355.009 349.485 357.633 316.19 314.012C286.594 355.416 271.378 371.247 260.19 314.012C215.807 357.259 202.209 356.053 203.19 297.012C148.122 326.993 136.572 323.65 147.69 284.512C109.419 290.68 101.5 284.577 128.19 247.012C161.938 196.228 182.415 169.232 225.19 127.012Z',
  'M280.891 23.4164C283.286 16.0459 293.713 16.0459 296.108 23.4164L304.44 49.0598C305.511 52.356 308.583 54.5877 312.048 54.5877L339.012 54.5877C346.761 54.5877 349.983 64.5046 343.714 69.0598L321.9 84.9083C319.096 86.9454 317.923 90.5564 318.994 93.8525L327.326 119.496C329.721 126.866 321.285 132.995 315.015 128.44L293.202 112.592C290.398 110.555 286.601 110.555 283.797 112.592L261.984 128.44C255.714 132.995 247.278 126.866 249.673 119.496L258.005 93.8525C259.076 90.5564 257.903 86.9454 255.099 84.9083L233.285 69.0598C227.016 64.5046 230.238 54.5877 237.988 54.5877L264.951 54.5877C268.416 54.5877 271.488 52.356 272.559 49.0598L280.891 23.4164Z',
]
// 위 배열은 src/assets/Tree.svg 파일을 열어서
// 각 <path d="..."> 안에 있는 d 문자열을 그대로 복사해 온 것입니다.
// 이 문자열들은 나중에 new Path2D(d문자열)로 감싸서
// "이 점이 트리 안에 있는지(isPointInPath)" 계산할 때 사용합니다.

// HomeCanvas 컴포넌트는 실제로 화면에 나타나는 React 컴포넌트입니다.
// 여기 안에 캔버스와 드래그 로직, 트리 이미지 렌더링 로직이 모두 들어 있습니다.
function HomeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null) // 실제 <canvas> DOM 요소를 가리키는 ref (초기에는 null)
  const dragOffsetRef = useRef({ x: 0, y: 0 }) // 드래그 시작 시, 마우스 위치와 오너먼트 중심의 차이를 기억하는 ref
  const draggedIdRef = useRef<string | null>(null) // 지금 드래그 중인 오너먼트의 id를 저장 (없으면 null)
  const treeImageRef = useRef<HTMLImageElement | null>(null) // 트리 SVG 이미지를 담아둘 Image 객체를 가리키는 ref
  const treePathsRef = useRef<Path2D[]>([]) // SVG path 문자열들을 Path2D로 변환해 저장해 두는 ref
  const treeTransformRef = useRef<{ offsetX: number; offsetY: number; scale: number } | null>(null) // SVG가 캔버스 어디에, 어떤 스케일로 그려졌는지 저장
  const [ornaments, setOrnaments] = useState<Ornament[]>([
    // 처음 화면에 보이는 기본 오너먼트 3개를 미리 만들어 둡니다.
    { id: 'base-1', x: TREE_CENTER_X - 40, y: TREE_TOP + 140, color: '#F87171', radius: 14 }, // 트리 위쪽 왼쪽에 있는 빨간색 장식
    { id: 'base-2', x: TREE_CENTER_X + 60, y: TREE_TOP + 220, color: '#60A5FA', radius: 12 }, // 중간 오른쪽에 있는 파란색 장식
    { id: 'base-3', x: TREE_CENTER_X, y: TREE_TOP + 300, color: '#FACC15', radius: 16 }, // 아래쪽 가운데에 있는 노란색 장식
  ])

  const ctx = useRef<CanvasRenderingContext2D | null>(null) // 2D 캔버스 그리기용 context를 저장할 ref (초기에는 null)

  // 컴포넌트가 처음 화면에 나타났을 때 한 번만 실행되는 효과 훅입니다.
  // 여기서 캔버스 context를 준비하고, 트리 이미지를 로드합니다.
  useEffect(() => {
    const canvas = canvasRef.current // ref를 통해 실제 <canvas> DOM 요소를 가져옵니다.
    if (!canvas) return // 혹시라도 ref가 아직 연결되지 않았다면 그냥 종료합니다.
    ctx.current = canvas.getContext('2d') // 2D 그리기용 context를 꺼내서 ref에 저장합니다.

    // 트리 SVG 이미지를 메모리에 로드합니다.
    const img = new Image() // HTMLImageElement 인스턴스를 생성합니다.
    img.src = treeSvg // Webpack/Vite가 변환한 실제 이미지 URL 문자열을 src에 넣습니다.
    img.onload = () => {
      // 이미지 로드가 끝난 뒤 실행되는 콜백입니다.
      treeImageRef.current = img // 나중에 drawImage에서 사용할 수 있도록 ref에 저장해 둡니다.
      treePathsRef.current = treePathData.map((path) => new Path2D(path)) // SVG path 문자열을 Path2D 객체로 변환해 배열에 저장합니다.
      drawScene() // 이미지와 Path가 준비되었으니, 첫 화면을 그립니다.
    }
  }, []) // 의존성 배열이 빈 배열이므로, 이 효과는 마운트 시 한 번만 실행됩니다.

  // ornaments 상태(장식 위치나 수)가 바뀔 때마다 캔버스를 다시 그리는 효과입니다.
  useEffect(() => {
    drawScene() // 장식이 바뀌면 전체 장면을 다시 그립니다.
  }, [ornaments]) // ornaments 배열이 변경될 때마다 실행됩니다.

  // 전체 장면(배경 + 트리 이미지 + 장식들)을 그리는 함수입니다.
  const drawScene = () => {
    const canvas = canvasRef.current // 현재 캔버스 DOM 요소
    const context = ctx.current // 2D context
    if (!canvas || !context) return // 둘 중 하나라도 준비되지 않았다면 그릴 수 없으므로 종료

    context.clearRect(0, 0, canvas.width, canvas.height) // 이전에 그려진 모든 내용을 지웁니다.

    // 배경을 위에서 아래로 그라데이션(어두운 파란색)으로 채웁니다.
    const gradient = context.createLinearGradient(0, 0, 0, CANVAS_SIZE) // 세로 방향 그라데이션 생성
    gradient.addColorStop(0, '#0C4A6E') // 위쪽 색상(더 밝은 파란색)
    gradient.addColorStop(1, '#082F49') // 아래쪽 색상(더 어두운 파란색)
    context.fillStyle = gradient // 채우기 스타일을 그라데이션으로 설정
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE) // 캔버스 전체를 채웁니다.

    // 캔버스 아래 부분을 하얀색(눈바닥)으로 채웁니다.
    context.fillStyle = '#F8FAFC' // 눈 색상
    context.fillRect(0, TREE_BOTTOM, CANVAS_SIZE, CANVAS_SIZE - TREE_BOTTOM) // 트리 바닥 아래 영역을 채웁니다.

    // 트리 SVG 이미지를 그립니다. (트리 위치/크기 정보도 이 함수 안에서 계산됩니다.)
    drawTreeImage(context) // SVG 이미지를 캔버스에 그림

    // 현재 ornaments 배열에 들어 있는 모든 장식을 한 개씩 그립니다.
    ornaments.forEach((ornament) => drawOrnament(context, ornament)) // 오너먼트 렌더
  }

  // 트리 SVG 이미지를 캔버스 가운데에 맞춰서 그리는 함수입니다.
  const drawTreeImage = (context: CanvasRenderingContext2D) => {
    const treeImage = treeImageRef.current // 로드된 트리 이미지 객체
    if (!treeImage) return // 아직 이미지가 준비되지 않았다면 아무것도 그리지 않고 종료합니다.

    // 트리가 차지해야 할 세로 높이를 계산합니다. (트리 꼭대기 ~ 트리 바닥 사이)
    const targetHeight = TREE_BOTTOM - (TREE_TOP - 20) // 살짝 위로 올리기 위해 TREE_TOP에서 20을 뺍니다.
    const scale = targetHeight / treeImage.height // 원본 이미지 높이 대비 비율을 계산합니다.
    const drawWidth = treeImage.width * scale // 위의 스케일에 맞춰 가로 폭을 계산합니다.
    const drawHeight = treeImage.height * scale // 위의 스케일에 맞춰 세로 높이를 계산합니다.
    const offsetX = (CANVAS_SIZE - drawWidth) / 2 // 캔버스 가운데에 위치시키기 위한 X 좌표
    const offsetY = TREE_TOP - 20 // 트리 꼭대기를 약간 위로 당겨서 자연스럽게 보이게 하는 Y 좌표

    // 나중에 hit-test(점이 트리 내부인지 검사)를 할 때 사용할 좌표 변환 값을 저장해 둡니다.
    treeTransformRef.current = { offsetX, offsetY, scale } // Path2D 좌표를 캔버스 좌표로 맞추기 위한 정보

    // 실제 이미지 그리기: (원본 전체를 offsetX, offsetY 위치에 스케일 적용해 그립니다.)
    context.drawImage(treeImage, offsetX, offsetY, drawWidth, drawHeight) // SVG 이미지를 캔버스에 그림
  }

  // 캔버스 상의 한 점(canvasX, canvasY)을 SVG 원본 좌표계 상의 점으로 변환하는 함수입니다.
  const canvasToSvgPoint = (canvasX: number, canvasY: number) => {
    const transform = treeTransformRef.current // 이미지가 얼마나 확대/축소되고 어디에 그려졌는지 정보
    if (!transform || transform.scale === 0) return null // 아직 정보가 없거나 스케일이 0이면 변환 불가
    return {
      x: (canvasX - transform.offsetX) / transform.scale, // 캔버스 X에서 트리의 offset을 빼고 스케일로 나눠 SVG X로 변환
      y: (canvasY - transform.offsetY) / transform.scale, // 캔버스 Y에서 offset을 빼고 스케일로 나눠 SVG Y로 변환
    }
  }

  // 주어진 캔버스 좌표가 트리 모양(SVG Path) 안에 들어있는지 검사하는 함수입니다.
  const isPointInsideTree = (canvasX: number, canvasY: number) => {
    const context = ctx.current // 2D context (isPointInPath 호출에 필요)
    const svgPoint = canvasToSvgPoint(canvasX, canvasY) // 캔버스 좌표를 SVG 좌표로 바꿉니다.
    // context 또는 svgPoint가 없거나 Path 정보가 비어 있으면 판단할 수 없으니 false를 반환합니다.
    if (!context || !svgPoint || treePathsRef.current.length === 0) return false
    // 준비된 모든 Path2D에 대해 isPointInPath를 호출해, 어느 하나라도 내부에 있으면 true를 반환합니다.
    return treePathsRef.current.some((path) => context.isPointInPath(path, svgPoint.x, svgPoint.y))
  }

  // 드래그 중에 오너먼트를 트리 외곽선 안으로만 제한하는 함수입니다.
  const constrainToTree = (x: number, y: number, fallback: Ornament) => {
    // 트리 이미지나 Path 정보가 아직 초기화되지 않았다면, 제약을 걸지 않고 원래 좌표를 그대로 사용합니다.
    if (!treeImageRef.current || treePathsRef.current.length === 0 || !treeTransformRef.current) {
      return { x, y } // 트리 이미지가 아직 준비되지 않았다면 그대로 허용
    }

    // 이미 트리 안쪽에 있는 좌표라면 그대로 허용합니다.
    if (isPointInsideTree(x, y)) {
      return { x, y } // 이미 트리 내부라면 그대로
    }

    // 그렇지 않다면, 트리 중앙을 향해 조금씩 이동시키면서 "가장 가까운 내부 지점"을 찾으려고 시도합니다.
    const centerX = TREE_CENTER_X // 트리 중심 X
    const centerY = TREE_TOP + (TREE_BOTTOM - TREE_TOP) / 2 // 트리 중심 Y (위와 아래의 중간)
    let testX = x // 탐색용 X 좌표 시작값
    let testY = y // 탐색용 Y 좌표 시작값

    // 최대 40번 정도 반복하면서 점을 중심 방향으로 조금씩 이동시킵니다.
    for (let i = 0; i < 40; i++) {
      testX += (centerX - testX) * 0.2 // 현재 위치에서 중심까지의 20%만큼 이동 (보간)
      testY += (centerY - testY) * 0.2 // Y도 같은 방식으로 이동
      if (isPointInsideTree(testX, testY)) {
        // 이동 도중 트리 내부에 진입했다면, 그 위치를 허용 위치로 사용합니다.
        return { x: testX, y: testY } // 내부 지점을 찾으면 반환
      }
    }

    // 위 반복으로도 내부 지점을 찾지 못한 경우, 오너먼트를 현재 위치로 옮기지 않고 원래 자리로 되돌립니다.
    return { x: fallback.x, y: fallback.y } // 실패 시 기존 위치 유지
  }

  // 실제로 오너먼트를 원(동그라미) 형태로 그리는 함수입니다.
  const drawOrnament = (context: CanvasRenderingContext2D, ornament: Ornament) => {
    context.beginPath() // 새로운 그림 경로를 시작합니다.
    context.arc(ornament.x, ornament.y, ornament.radius, 0, Math.PI * 2) // 중심(x, y), 반지름을 가진 전체 원을 그립니다.
    context.fillStyle = ornament.color // 오너먼트 안쪽을 채울 색상을 설정합니다.
    context.fill() // 채우기를 수행합니다.
    context.strokeStyle = 'rgba(255,255,255,0.2)' // 외곽선을 약간 흰색에 가까운 반투명 색으로 설정합니다.
    context.lineWidth = 2 // 외곽선 두께를 2픽셀로 설정합니다.
    context.stroke() // 외곽선을 실제로 그립니다.
  }

  // 주어진 좌표(x, y)가 어떤 오너먼트 위에 있는지 찾는 함수입니다(마우스 클릭 시 사용).
  const pickOrnament = (x: number, y: number) => {
    // 배열의 뒤에서부터 검사하는 이유:
    // 나중에 그려진(화면에서 위에 보이는) 오너먼트가 우선 선택되도록 하기 위함입니다.
    for (let i = ornaments.length - 1; i >= 0; i--) {
      const target = ornaments[i] // i번째 오너먼트를 가져옵니다.
      const dx = x - target.x // 마우스 X와 오너먼트 중심 X의 거리 차이
      const dy = y - target.y // 마우스 Y와 오너먼트 중심 Y의 거리 차이
      // 피타고라스 정리로 거리(√(dx^2 + dy^2))를 구한 뒤,
      // 그 값이 반지름 + 약간의 여유(2픽셀)보다 작거나 같으면 "위에 있다"고 판단합니다.
      if (Math.sqrt(dx * dx + dy * dy) <= target.radius + 2) {
        return target // 이 오너먼트를 선택 대상으로 반환합니다.
      }
    }
    return null // 아무 오너먼트도 클릭되지 않았다면 null 반환
  }

  // React의 마우스 이벤트에서 캔버스 내부 좌표를 계산하는 헬퍼 함수입니다.
  const canvasPointFromEvent = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect() // 캔버스의 화면상 위치와 크기를 가져옵니다.
    if (!rect) return { x: 0, y: 0 } // 만약 ref가 준비되지 않았다면 임시로 (0, 0)을 반환합니다.
    return {
      x: event.clientX - rect.left, // 브라우저 전체 기준 X 좌표에서 캔버스의 왼쪽 위치를 빼서, 캔버스 기준 X로 변환
      y: event.clientY - rect.top, // 브라우저 전체 기준 Y 좌표에서 캔버스의 위쪽 위치를 빼서, 캔버스 기준 Y로 변환
    }
  }

  // 마우스를 누를 때(드래그 시작 시) 호출되는 핸들러입니다.
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = canvasPointFromEvent(event) // 클릭한 지점을 캔버스 좌표로 변환합니다.
    const target = pickOrnament(x, y) // 그 지점에 있는 오너먼트가 있는지 찾습니다.
    if (!target) return // 선택된 오너먼트가 없다면 아무것도 하지 않습니다.

    draggedIdRef.current = target.id // 이제 이 오너먼트를 드래그 중이라고 표시합니다.
    dragOffsetRef.current = {
      x: x - target.x, // 마우스 위치와 오너먼트 중심 사이의 X 거리 차이를 기록합니다.
      y: y - target.y, // 마우스 위치와 오너먼트 중심 사이의 Y 거리 차이를 기록합니다.
    }
  }

  // 마우스를 움직일 때(드래그 중) 호출되는 핸들러입니다.
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const draggedId = draggedIdRef.current // 현재 드래그 중인 오너먼트 id를 가져옵니다.
    if (!draggedId) return // 드래그 중인 대상이 없다면 아무것도 하지 않습니다.
    const { x, y } = canvasPointFromEvent(event) // 현재 마우스 위치를 캔버스 좌표로 변환합니다.

    // ornaments 상태를 업데이트합니다.
    setOrnaments((prev) =>
      prev.map((ornament) => {
        if (ornament.id !== draggedId) return ornament // 이 오너먼트가 지금 드래그 중인 대상이 아니라면 그대로 반환합니다.
        const proposedX = x - dragOffsetRef.current.x // 드래그 시작 시의 오프셋을 빼, 오너먼트 중심 X 위치를 계산합니다.
        const proposedY = y - dragOffsetRef.current.y // 마찬가지로 Y 위치를 계산합니다.
        const constrained = constrainToTree(proposedX, proposedY, ornament) // 계산된 위치를 트리 안쪽으로 제한합니다.
        return { ...ornament, ...constrained } // 제한된 좌표를 적용한 새 오너먼트 객체를 반환합니다.
      })
    )
  }

  // 마우스를 떼었을 때(드래그 종료 시) 호출되는 핸들러입니다.
  const handleMouseUp = () => {
    draggedIdRef.current = null // 더 이상 드래그 중인 대상이 없다고 표시합니다.
  }

  // 실제로 화면에 렌더링되는 JSX 구조입니다.
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <canvas
        ref={canvasRef} // 이 캔버스 DOM 요소를 canvasRef에 연결합니다.
        width={CANVAS_SIZE} // 캔버스의 가로 픽셀 수를 600으로 설정합니다.
        height={CANVAS_SIZE} // 캔버스의 세로 픽셀 수를 600으로 설정합니다.
        className="rounded-3xl border-4 border-white/30 shadow-2xl" // Tailwind 클래스로 둥근 모서리, 테두리, 그림자 스타일을 지정합니다.
        onMouseDown={handleMouseDown} // 캔버스 위에서 마우스를 눌렀을 때 실행할 함수
        onMouseMove={handleMouseMove} // 캔버스 위에서 마우스를 움직일 때 실행할 함수
        onMouseUp={handleMouseUp} // 캔버스 위에서 마우스를 뗐을 때 실행할 함수
      />
    </div>
  )
}

// TanStack Router에 이 파일이 "/" 경로를 담당한다고 알려주는 부분입니다.
export const Route = createFileRoute('/')({
  component: HomeCanvas, // "/" 경로에 접속했을 때 렌더링할 컴포넌트로 HomeCanvas를 사용합니다.
})


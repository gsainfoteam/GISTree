import windowSvg from '../assets/window.svg'
import { useMemo } from 'react'

const SNOW_COUNT = 30

type Snowflake = {
  id: number
  left: number
  duration: number
  delay: number
  size: number
  opacity: number
}

const random = (min: number, max: number) => Math.random() * (max - min) + min

export default function WindowWithSnow() {
  const flakes: Snowflake[] = useMemo(
    () =>
      Array.from({ length: SNOW_COUNT }).map((_, index) => ({
        id: index,
        left: random(0, 100),
        duration: random(6, 14),
        delay: random(-14, 0),
        size: random(4, 9),
        opacity: random(0.4, 0.9),
      })),
    [],
  )

  return (
    <div className="relative inline-block">
      {/* 창문 이미지 */}
      <img
        src={windowSvg}
        alt="window"
        className="block h-[40vh] select-none pointer-events-none"
      />

      {/* 창문 유리 부분만 보여주는 눈 영역 */}
      {/* window.svg 기준: viewBox 466x406, 유리 rect는 x=35,y=28,w=403,h=341 */}
      <div
        className="pointer-events-none absolute overflow-hidden"
        style={{
          left: '7.5%', // 35 / 466
          top: '6.9%', // 28 / 406
          width: '86.5%', // 403 / 466
          height: '84%', // 341 / 406
        }}
      >
        {flakes.map((flake) => (
          <span
            key={flake.id}
            className="absolute block rounded-full bg-white animate-snowfall"
            style={{
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              animationDuration: `${flake.duration}s`,
              animationDelay: `${flake.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}



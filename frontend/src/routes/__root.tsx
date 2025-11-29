//공통 레이아웃
import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import Sidebar from '../components/Sidebar'
import backgroundSvg from '../assets/background.svg'
import WindowWithSnow from '../components/WindowWithSnow'

export const Route = createRootRoute({
  component: () => {
    const location = useLocation()
    const isLoginPage = location.pathname === '/login'

    // login 페이지는 레이아웃 없이 렌더링
    if (isLoginPage) {
      return <Outlet />
    }

    // 다른 페이지는 레이아웃 적용
    return (
      <div
        className="flex h-screen w-full bg-no-repeat bg-right relative overflow-hidden"
        style={{
          backgroundImage: `url(${backgroundSvg})`,
          backgroundSize: 'auto 100%',
        }}
      >
        {/* 배경 레이어 */}
        <div className="absolute inset-0 -z-10" />

        {/* 오른쪽 창문 + 눈 내리는 배경 - 창문 상단이 화면 상단으로부터 1/3 지점 */}
        <div className="pointer-events-none absolute right-20 top-1/8 z-0">
          <WindowWithSnow />
        </div>
        
        {/* 콘텐츠 레이어 */}
        <div className="flex h-screen w-full relative z-10">
          <Sidebar />
          <main className="flex-1 bg-transparent">
            <Outlet />
          </main>
        </div>
      </div>
    )
  },
})

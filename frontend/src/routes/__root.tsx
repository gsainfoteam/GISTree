//공통 레이아웃
import { createRootRoute, Outlet } from '@tanstack/react-router'
import Sidebar from '../components/Sidebar'
import backgroundSvg from '../assets/background.svg'

export const Route = createRootRoute({
  component: () => (
    <div
      className="flex h-screen w-full bg-no-repeat bg-right relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundSvg})`,
        backgroundSize: 'auto 100%',
      }}
    >
      {/* 배경 레이어 */}
      <div className="absolute inset-0 -z-10" />
      
      {/* 콘텐츠 레이어 */}
      <div className="flex h-screen w-full relative z-10">
        <Sidebar />
        <main className="flex-1 bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  ),
})

//공통 레이아웃
import { createRootRoute, Outlet } from '@tanstack/react-router'
import Sidebar from '../components/Sidebar'

export const Route = createRootRoute({
  component: () => (
    <div className="flex h-screen w-full"> {/*flex 가로로 배치*/}
      <Sidebar />
      <main className="flex-1 bg-white"> {/*flex-1 남은 화면 전부 차지*/}
        <Outlet /> {/*Outlet Router의 자리표시자. 현재 URL 페이지를 이 자리에 렌더링. /mypage면 routes/mypage.tsx의 컴포넌트가 여기 렌더링.*/}
      </main>
    </div>
  ),
})

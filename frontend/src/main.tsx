import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// routeTree 자동 생성 파일 import
import { routeTree } from './routeTree.gen' 

// 라우터 생성
const router = createRouter({ routeTree })

// 타입스크립트용 선언
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// React 루트 렌더링
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}

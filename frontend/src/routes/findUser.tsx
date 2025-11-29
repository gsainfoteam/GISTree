import { createFileRoute, Link } from '@tanstack/react-router'
import logoSvg from '../assets/logo.svg'
import searchSvg from '../assets/search.svg'

export const Route = createFileRoute('/findUser')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <div className="w-full h-full flex flex-col">
      {/* 네비게이션 바 */}
      <div className="bg-white px-6 py-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          <span className="font-medium">방으로 돌아가기</span>
        </Link>
      </div>
      <div className="flex flex-col gap-[30px] items-center justify-center h-screen bg-white">
        <img src={logoSvg} alt="logo" className="w-[300px] h-auto" />
        <div className="flex border-[1px] border-black w-auto gap-[30px] py-[5px] px-[30px] justify-between items-center rounded-[10px] bg-white">
          <span className="font-semibold text-md text-[#D9D9D9]">친구의 이름을 입력해주세요. ex) 25 홍길동</span>
          <img src={searchSvg} alt="search" className="w-[30px] h-auto" />
        </div>
      </div>
    </div>
  )
}

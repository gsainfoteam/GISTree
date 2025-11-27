import { createFileRoute, Link } from '@tanstack/react-router'

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
      <div className="flex-1 overflow-auto p-6 bg-[#FFF6E9] relative">content</div>
    </div>
  )
}

import { Link } from '@tanstack/react-router'

export default function Sidebar() {
  // 임시 사용자 데이터 (나중에 실제 데이터로 교체)
  const userName = '채수연'
  const userGrade = '25'
  
  return (
    <div className="flex h-screen w-64 flex-col items-center justify-between gap-4 bg-transparent p-6">
      {/* 사용자 정보 섹션 */}
      <div className="flex w-full flex-col items-center gap-8">
        {/* 사용자 이름 및 나이 */}
        <div className="flex w-full items-center justify-between rounded-2xl bg-[#835353] px-4 py-2">
          <div className="text-center text-xl font-bold">
            <span className="text-[#B1ECA5]">
              {userName}({userGrade})
            </span>
            <span className="text-white">의 방</span>
          </div>
        </div>
        
        {/* 프로필 이미지*/}
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-black">
          {/* 프로필 이미지가 있으면 여기에 표시 */}
        </div>
      </div>
      
      <div className="flex w-full flex-col items-center gap-6 px-4 pt-10">
        {/* 쪽지함 버튼*/}
        <Link 
          to="/msgBox"
          className="flex w-full items-center justify-between rounded-[15px] bg-[#835353] px-4 py-2 text-white"
        >
          {/* 봉투/쪽지 아이콘 */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
          <span>쪽지함</span>
        </Link>
        
        {/*친구집 방문하기 버튼 */}
        <Link to="/findUser" className="w-full">
          <div className="flex w-full items-center justify-between rounded-[15px] bg-[#835353] px-4 py-2 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>친구집 방문하기</span>
          </div>
        </Link>
      </div>
    </div>
  )
}

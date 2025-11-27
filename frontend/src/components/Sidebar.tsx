import { Link } from '@tanstack/react-router'

export default function Sidebar() {
  // 임시 사용자 데이터 (나중에 실제 데이터로 교체)
  const userName = '채수연'
  const userGrade = '25'
  
  return (
    <div className="flex h-screen w-64 flex-col items-center justify-between gap-4 bg-transparent p-6">
      {/* 사용자 정보 섹션 */}
      <div className="flex w-full flex-col items-center gap-[30px]">
        {/* 사용자 이름 및 나이 */}
        <div className="flex w-full justify-center items-center rounded-2xl bg-[#835353] px-4 py-2">
          <div className="text-2xl font-bold">
            <div className="text-[#B1ECA5]">
              {userName}({userGrade})<span className="text-white">의 방</span>
            </div>
          </div>
        </div>
        
        {/* 프로필 이미지*/}
        <div className="flex h-34 w-34 items-center justify-center rounded-full bg-black">
          {/* 프로필 이미지가 있으면 여기에 표시 */}
        </div>
      </div>
      
      <div className="flex w-full flex-col items-center gap-6 px-4 pt-10">
        {/* 쪽지함 버튼*/}
        <Link 
          to="/msgBox"
          className="flex w-full items-center justify-center rounded-[15px] bg-[#835353] px-4 py-2 text-white font-semibold text-lg"
        >
          {/* 봉투/쪽지 아이콘 여기에 */}
          <span>쪽지함</span>
        </Link>
        
        {/*친구집 방문하기 버튼 */}
        <Link to="/findUser" className="w-full">
          <div className="flex w-full items-center justify-center rounded-[15px] bg-[#835353] px-4 py-2 text-white font-semibold text-lg">
            {/* 친구집 아이콘 여기에 */}
            <span>친구집 방문하기</span>
          </div>
        </Link>
      </div>
    </div>
  )
}

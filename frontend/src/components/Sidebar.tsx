import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { apiRequest } from '../utils/api'

// 사용자 정보 타입
type UserInfo = {
  name: string
  studentId: string
}

export default function Sidebar() {
  // 사용자 정보 상태 관리
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 컴포넌트가 마운트될 때 사용자 정보 가져오기
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const data = await apiRequest<{ name: string; studentId: string }>('/users/me')
        setUserInfo(data)
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserInfo()
  }, [])

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="flex h-screen w-64 flex-col items-center justify-between gap-4 bg-transparent p-6">
        <div className="flex w-full flex-col items-center gap-[30px]">
          <div className="flex w-full justify-center items-center rounded-2xl bg-[#835353] px-4 py-2">
            <div className="text-2xl font-bold">
              <div className="text-[#B1ECA5]">
                로딩 중...<span className="text-white">의 방</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const userName = userInfo?.name || '사용자'
  // 학번에서 3번째와 4번째 숫자만 추출 (예: 20255212 → 25)
  const fullStudentId = userInfo?.studentId || '00000000'
  const userGrade = fullStudentId.length >= 4 ? fullStudentId.slice(2, 4) : fullStudentId
  
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

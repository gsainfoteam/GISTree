export default function Sidebar() {
  // 임시 사용자 데이터 (나중에 실제 데이터로 교체)
  const userName = "채수연";
  const userAge = 25;
  
  return (
    <div className="w-64 h-screen bg-orange-100 flex flex-col items-center py-8 px-4">
      {/* 사용자 정보 섹션 */}
      <div className="w-full flex flex-col items-center mb-8">
        {/* 사용자 이름 및 나이 */}
        <h2 className="text-xl font-bold mb-6 text-center">
          <span className="text-blue-600">{userName}({userAge})</span>
          <span className="text-black">의 방</span>
        </h2>
        
        {/* 프로필 이미지 - 큰 검은 원 */}
        <div className="w-32 h-32 rounded-full bg-black flex items-center justify-center">
          {/* 프로필 이미지가 있으면 여기에 표시 */}
        </div>
      </div>
      
      {/* 쪽지함 버튼 - 어두운 갈색/앰버 */}
      <button className="w-full bg-amber-800 hover:bg-amber-900 text-white font-medium py-3.5 px-4 rounded-lg mb-4 flex items-center justify-center gap-2.5 transition-colors shadow-sm">
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
      </button>
      
      {/* 하단 친구집 방문하기 버튼 */}
      <div className="mt-auto w-full pb-4">
        <button className="w-full bg-orange-200 hover:bg-orange-300 text-gray-800 font-medium py-3.5 px-4 rounded-lg flex items-center justify-center gap-2.5 transition-colors shadow-sm">
          {/* 집 아이콘 */}
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
        </button>
      </div>
    </div>
  );
}

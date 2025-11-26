import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import MsgCard from '../components/MsgCard'

function RouteComponent() {
  // 모달 상태 관리
  const [isMsgOpen, setIsMsgOpen] = useState(false) //[변수이름(모달열려있는지), 함수이름(변수상태전환. 모달열고닫기)]=초기값
  const [selectedMsg, setSelectedMsg] = useState<{ //[선택된메시지데이터, 선택된 메세지 전환함수]=<{...}|null> ...또는 null. (초기값null)
    recipient: string;
    content: string;
    sender: string;
  } | null>(null)

  // 임시 메시지 데이터 (나중에 API에서 가져올 데이터)
  const messages = [ //messages=메시지데이터배열
    {
      recipient: '수연',
      content: '덕분에 올해도 행복했어. 내년에도 친하게 지내자. 건강하고 맛있는 것도 많이 먹고 즐겁고 따뜻한 연말 보내.',
      sender: '익명'
    },
    {
      recipient: '수연',
      content: '덕분에 올해도 행복했어. 내년에도 친하게 지내자. 건강하고 맛있는 것도 많이 먹고 즐겁고 따뜻한 연말 보내. 시간 되면 같이 밥이라도 먹자.',
      sender: '익명'
    },
    {
      recipient: '수연',
      content: '올 한 해 정말 고마웠어. 내년에도 함께 즐거운 시간 보내자.',
      sender: '익명'
    },
    {
      recipient: '수연',
      content: '덕분에 올해도 행복했어. 내년에도 친하게 지내자.',
      sender: '익명'
    },
    {
      recipient: '수연',
      content: '건강하고 맛있는 것도 많이 먹고 즐겁고 따뜻한 연말 보내.',
      sender: '익명'
    },
    {
      recipient: '수연',
      content: '시간 되면 같이 밥이라도 먹자. 항상 응원할게!',
      sender: '익명'
    }
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* 네비게이션 바 */}
      <div className="border-b border-gray-200 px-6 py-4">
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

      {/* 메시지 카드 그리드 */}
      <div className="flex-1 overflow-auto p-6 bg-gray-200 relative">
        <div className="grid grid-cols-2 gap-6 max-w-6xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedMsg(message)
                setIsMsgOpen(true)
              }}
              className="cursor-pointer"
            >
              <MsgCard 
                recipient={message.recipient}
                content={message.content}
                sender={message.sender}
              />
            </div>
          ))}
        </div>

        {/* 모달 - 사이드바와 네비게이션 바를 제외한 영역에만 표시 */}
        {isMsgOpen && selectedMsg && (
          <>
            {/* 배경 오버레이 */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMsgOpen(false)}
            />
            
            {/* 모달 컨텐츠 */}
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div 
                className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl mx-8 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 모달 내부 메시지 카드 */}
                <MsgCard 
                  recipient={selectedMsg.recipient}
                  content={selectedMsg.content}
                  sender={selectedMsg.sender}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/msgBox')({
  component: RouteComponent,
})


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
        {isMsgOpen && selectedMsg && ( //조건이 모두 참일 때
          <> //불필요한 div를 안 쓰려고.
            {/* 배경 오버레이 */}
            <div 
              className="absolute inset-0 bg-black/50 z-40"
              onClick={() => setIsMsgOpen(false)}
            />
            
            {/* 모달 컨텐츠 */}
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="flex flex-col w-[600px] h-[500px] p-[30px] justify-between items-center gap-[20px]
              rounded-[20px] border-[5px] border-pink-200 bg-yellow-100">
              
                <div className="bg-orange-100 w-full h-auto flex justify-end p-[10px] items-center gap-[10px]">
                  <button onClick={() => setIsMsgOpen(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 30 30" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M7.7836 7.78379C8.14971 7.41767 8.7433 7.41767 9.10942 7.78379L14.9998 13.6742L20.8902 7.78379C21.2563 7.41767 21.8499 7.41767 22.216 7.78379C22.5821 8.1499 22.5821 8.7435 22.216 9.10961L16.3256 15L22.216 20.8904C22.5821 21.2565 22.5821 21.8501 22.216 22.2162C21.8499 22.5823 21.2563 22.5823 20.8902 22.2162L14.9998 16.3258L9.10942 22.2162C8.7433 22.5823 8.14971 22.5823 7.7836 22.2162C7.41748 21.8501 7.41748 21.2565 7.7836 20.8904L13.674 15L7.7836 9.10961C7.41748 8.7435 7.41748 8.1499 7.7836 7.78379Z" fill="black"/>
                    </svg>
                  </button>
                </div>
                {/* 모달 내부 메시지 카드 */}
                <div className="w-full flex-1 flex flex-col justify-between items-center">
                  <div className="w-full flex p-[10px] justify-start items-center gap-[10px]
                  font-semibold text-gray-800">
                    To. {selectedMsg.recipient}
                  </div>
                  <div className="w-full flex p-[10px] justify-center items-center gap-[10px]
                  text-gray-700 text-sm">
                    {selectedMsg.content}
                  </div>
                  <div className="w-full flex p-[10px] justify-end items-center gap-[10px]
                  font-semibold text-gray-800">
                    From. {selectedMsg.sender}
                  </div>
                </div>
                <Link 
                  to="/postMsg"
                  className="bg-pink-200 flex py-[10px] px-[30px] justify-center items-center gap-[10px] rounded-[10px]"
                >
                  <span>답장하기</span>
                </Link>
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


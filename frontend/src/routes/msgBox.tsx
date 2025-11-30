import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import MsgCard from '../components/MsgCard'
import patternSvg from '../assets/pattern.svg'

function RouteComponent() {
  // 모달 상태 관리
  const [isMsgOpen, setIsMsgOpen] = useState(false) //[변수이름(모달열려있는지), 함수이름(변수상태전환. 모달열고닫기)]=초기값
  const [isReplyOpen, setIsReplyOpen] = useState(false) // 답장하기 모달 상태
  const [selectedMsg, setSelectedMsg] = useState<{ //[선택된메시지데이터, 선택된 메세지 전환함수]=<{...}|null> ...또는 null. (초기값null)
    recipient: string;
    content: string;
    sender: string;
  } | null>(null)
  const [replyContent, setReplyContent] = useState('') // 답장 내용

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
          <span className="font-medium">돌아가기</span>
        </Link>
      </div>

      {/* 메시지 카드 그리드 */}
      <div className="flex-1 overflow-auto py-6 px-10 bg-[#FFF6E9] relative">
        <div className="grid place-items-center gap-y-[50px] gap-x-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))] max-w-full">
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
          <>
            {/* 배경 오버레이 */}
            <div 
              className="absolute inset-0 bg-black/50 z-40"
              onClick={() => setIsMsgOpen(false)}
            />
            
            {/* 모달 컨텐츠 */}
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div 
                className="inline-flex rounded-[20px] p-[8px] bg-cover bg-no-repeat bg-center pointer-events-auto"
                style={{
                  backgroundImage: patternSvg.startsWith('data:') 
                    ? `url("${patternSvg}")` 
                    : `url(${patternSvg})`,
                }}
              >
                <div className="flex flex-col w-[600px] h-[500px] py-[20px] px-[40px] justify-between items-center gap-[20px]
              rounded-[12px] bg-[#F9F5E9] shadow-md">
              
                <div className="w-full h-auto flex justify-end p-[10px] items-center gap-[10px]">
                  <button onClick={() => setIsMsgOpen(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 30 30" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M7.7836 7.78379C8.14971 7.41767 8.7433 7.41767 9.10942 7.78379L14.9998 13.6742L20.8902 7.78379C21.2563 7.41767 21.8499 7.41767 22.216 7.78379C22.5821 8.1499 22.5821 8.7435 22.216 9.10961L16.3256 15L22.216 20.8904C22.5821 21.2565 22.5821 21.8501 22.216 22.2162C21.8499 22.5823 21.2563 22.5823 20.8902 22.2162L14.9998 16.3258L9.10942 22.2162C8.7433 22.5823 8.14971 22.5823 7.7836 22.2162C7.41748 21.8501 7.41748 21.2565 7.7836 20.8904L13.674 15L7.7836 9.10961C7.41748 8.7435 7.41748 8.1499 7.7836 7.78379Z" fill="black"/>
                    </svg>
                  </button>
                </div>
                {/* 모달 내부 메시지 카드 */}
                <div className="w-full flex-1 flex flex-col justify-between items-center">
                  <div className="w-full flex p-[10px] justify-start items-center gap-[10px]
                  font-semibold text-lg text-gray-800">
                    To. {selectedMsg.recipient}
                  </div>
                  <div className="w-full flex px-[50px] justify-center items-center gap-[10px]
                  text-gray-700 text-md font-medium">
                    {selectedMsg.content}
                  </div>
                  <div className="w-full flex p-[10px] justify-end items-center gap-[10px]
                  font-semibold text-lg text-gray-800">
                    From. {selectedMsg.sender}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsReplyOpen(true)
                    setIsMsgOpen(false)
                  }}
                  className="bg-[#B80002] text-white font-semibold text-lg flex py-[5px] px-[20px] justify-center items-center gap-[10px] rounded-[15px] pointer-events-auto"
                >
                  <span>답장하기</span>
                </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 답장하기 모달 */}
        {isReplyOpen && selectedMsg && (
          <>
            {/* 배경 오버레이 */}
            <div 
              className="absolute inset-0 bg-black/50 z-40"
              onClick={() => {
                setIsReplyOpen(false)
                setReplyContent('')
              }}
            />
            
            {/* 답장하기 모달 컨텐츠 */}
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div 
                className="inline-flex rounded-[20px] p-[8px] bg-cover bg-no-repeat bg-center pointer-events-auto"
                style={{
                  backgroundImage: patternSvg.startsWith('data:') 
                    ? `url("${patternSvg}")` 
                    : `url(${patternSvg})`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col w-[600px] h-[500px] py-[20px] px-[40px] justify-between items-center gap-[20px]
              rounded-[12px] bg-[#F9F5E9] shadow-md">
                
                  <div className="w-full h-auto flex justify-end p-[10px] items-center gap-[10px]">
                    <button onClick={() => {
                      setIsReplyOpen(false)
                      setReplyContent('')
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 30 30" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.7836 7.78379C8.14971 7.41767 8.7433 7.41767 9.10942 7.78379L14.9998 13.6742L20.8902 7.78379C21.2563 7.41767 21.8499 7.41767 22.216 7.78379C22.5821 8.1499 22.5821 8.7435 22.216 9.10961L16.3256 15L22.216 20.8904C22.5821 21.2565 22.5821 21.8501 22.216 22.2162C21.8499 22.5823 21.2563 22.5823 20.8902 22.2162L14.9998 16.3258L9.10942 22.2162C8.7433 22.5823 8.14971 22.5823 7.7836 22.2162C7.41748 21.8501 7.41748 21.2565 7.7836 20.8904L13.674 15L7.7836 9.10961C7.41748 8.7435 7.41748 8.1499 7.7836 7.78379Z" fill="black"/>
                      </svg>
                    </button>
                  </div>
                  
                  {/* 답장하기 모달 내부 컨텐츠 */}
                  <div className="w-full flex-1 flex flex-col justify-between items-center gap-[20px]">
                    <div className="w-full flex p-[10px] justify-start items-center gap-[10px]
                    font-semibold text-lg text-gray-800">
                      To. {selectedMsg.sender}
                    </div>
                    
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="답장 내용을 입력해주세요..."
                      className="w-full flex-1 px-[20px] py-[15px] rounded-[10px] border border-gray-300 
                      text-gray-700 text-md font-medium resize-none outline-none focus:border-[#B80002] 
                      focus:ring-2 focus:ring-[#B80002]/20"
                    />
                    
                    <div className="w-full flex p-[10px] justify-end items-center gap-[10px] font-semibold text-lg text-gray-800">
                    From. {selectedMsg.recipient}
                    </div>

                    <div className="w-full flex justify-end items-center gap-[10px]">
                      <button
                        onClick={() => {
                          setIsReplyOpen(false)
                          setReplyContent('')
                          setIsMsgOpen(true)
                        }}
                        className="bg-transparent text-gray-700 font-medium text-lg flex py-[5px] px-[20px] 
                        justify-center items-center gap-[10px] border border-gray-300 rounded-[15px] w-auto hover:bg-white transition-colors"
                      >
                        <span>이전</span>
                      </button>
                      <button
                        onClick={() => {
                          // TODO: 답장 전송 API 호출
                          console.log('답장 전송:', {
                            to: selectedMsg.sender,
                            content: replyContent
                          })
                          setIsReplyOpen(false)
                          setReplyContent('')
                          // 성공 메시지 표시 등 추가 가능
                        }}
                        disabled={!replyContent.trim()}
                        className="bg-[#B80002] text-white font-semibold text-lg flex py-[5px] px-[20px] 
                        justify-center items-center gap-[10px] rounded-[15px] w-auto disabled:opacity-50 
                        disabled:cursor-not-allowed hover:bg-[#9a0002] transition-colors"
                      >
                        <span>전송하기</span>
                      </button>
                    </div>
                  </div>
                </div>
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


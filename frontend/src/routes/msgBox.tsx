import { createFileRoute, Link } from '@tanstack/react-router'
import MsgCard from '../components/MsgCard'

function RouteComponent() {
  // 임시 메시지 데이터 (나중에 API에서 가져올 데이터)
  const messages = [
    {
      recipient: '수연',
      content: [
        '덕분에 올해도 행복했어.',
        '내년에도 친하게 지내자.',
        '건강하고 맛있는 것도 많이 먹',
        '고 즐겁고 따뜻한 연말 보내.',
        '시간 되면 같이 밥이라도 먹...'
      ],
      sender: '익명'
    },
    {
      recipient: '수연',
      content: [
        '덕분에 올해도 행복했어.',
        '내년에도 친하게 지내자.',
        '건강하고 맛있는 것도 많이 먹',
        '고 즐겁고 따뜻한 연말 보내.',
        '시간 되면 같이 밥이라도 먹...'
      ],
      sender: '익명'
    },
    {
      recipient: '수연',
      content: [
        '덕분에 올해도 행복했어.',
        '내년에도 친하게 지내자.',
        '건강하고 맛있는 것도 많이 먹',
        '고 즐겁고 따뜻한 연말 보내.',
        '시간 되면 같이 밥이라도 먹...'
      ],
      sender: '익명'
    },
    {
      recipient: '수연',
      content: [
        '덕분에 올해도 행복했어.',
        '내년에도 친하게 지내자.',
        '건강하고 맛있는 것도 많이 먹',
        '고 즐겁고 따뜻한 연말 보내.',
        '시간 되면 같이 밥이라도 먹...'
      ],
      sender: '익명'
    },
    {
      recipient: '수연',
      content: [
        '덕분에 올해도 행복했어.',
        '내년에도 친하게 지내자.',
        '건강하고 맛있는 것도 많이 먹',
        '고 즐겁고 따뜻한 연말 보내.',
        '시간 되면 같이 밥이라도 먹...'
      ],
      sender: '익명'
    },
    {
      recipient: '수연',
      content: [
        '덕분에 올해도 행복했어.',
        '내년에도 친하게 지내자.',
        '건강하고 맛있는 것도 많이 먹',
        '고 즐겁고 따뜻한 연말 보내.',
        '시간 되면 같이 밥이라도 먹...'
      ],
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
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 gap-6 max-w-6xl mx-auto">
          {messages.map((message, index) => (
            <MsgCard 
              key={index}
              recipient={message.recipient}
              content={message.content}
              sender={message.sender}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/msgBox')({
  component: RouteComponent,
})


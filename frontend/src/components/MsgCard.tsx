interface MsgCardProps { //interface는 tsx에서 사용하는 타입 정의. props는 속성(properties).
  recipient: string;
  content: string; // 배열이 아닌 문자열로 변경
  sender: string;
}

export default function MsgCard({ recipient, content, sender }: MsgCardProps) {
  return (
    <div className="bg-gray-100 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="font-semibold text-gray-800 mb-3">
        To. {recipient}
      </div>
      <div className="text-gray-700 text-sm">
        {content}
      </div>
      <div className="font-semibold text-gray-800 mt-3">
        From. {sender}
      </div>
    </div>
  );
}


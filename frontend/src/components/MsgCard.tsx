interface MsgCardProps { //interface는 tsx에서 사용하는 타입 정의. props는 속성(properties).
  recipient: string;
  content: string; // 배열이 아닌 문자열로 변경
  sender: string;
}

export default function MsgCard({ recipient, content, sender }: MsgCardProps) {
  return (
    <div className="flex flex-col bg-gray-100 shadow-md hover:shadow-md transition-shadow hover:scale-105 transition-transform duration-400
    h-[210px] w-[280px] px-[20px] py-[15px] justify-between gap-[10px] rounded-[20px] border-[8px] border-[#A12925]/20 bg-white">
      <div className="font-semibold text-gray-800">
        To. {recipient}
      </div>
      <div className="px-[8px] text-gray-700 text-sm max-h-[100px]">
        {content}
      </div>
      <div className="self-end font-semibold text-gray-800">
        From. {sender}
      </div>
    </div>
  );
}


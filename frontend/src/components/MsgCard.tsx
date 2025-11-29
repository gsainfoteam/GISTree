import patternSvg from '../assets/pattern.svg'

interface MsgCardProps { //interface는 tsx에서 사용하는 타입 정의. props는 속성(properties).
  recipient: string;
  content: string; // 배열이 아닌 문자열로 변경
  sender: string;
}

export default function MsgCard({ recipient, content, sender }: MsgCardProps) {
  // data URL은 따옴표로 감싸야 할 수 있음
  const bgImage = patternSvg.startsWith('data:') 
    ? `url("${patternSvg}")` 
    : `url(${patternSvg})`
  
  return (
    <div 
      className="inline-flex rounded-[20px] p-[8px] bg-cover bg-no-repeat bg-center hover:shadow-md transition-shadow hover:scale-105 transition-transform duration-400"
      style={{
        backgroundImage: bgImage,
      }}
    >
      <div className="flex flex-col shadow-md
      h-[210px] w-[280px] px-[20px] py-[15px] justify-between gap-[10px] rounded-[12px] bg-[#F9F5E9]">
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
    </div>
  );
}


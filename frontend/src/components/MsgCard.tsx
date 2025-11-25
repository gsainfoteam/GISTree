interface MsgCardProps {
  recipient: string;
  content: string[];
  sender: string;
}

export default function MsgCard({ recipient, content, sender }: MsgCardProps) {
  return (
    <div className="bg-gray-100 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="font-semibold text-gray-800 mb-3">
        To. {recipient}
      </div>
      <div className="text-gray-700 text-sm leading-relaxed space-y-1">
        {content.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className="font-semibold text-gray-800 mb-3">
        From. {sender}
      </div>
    </div>
  );
}


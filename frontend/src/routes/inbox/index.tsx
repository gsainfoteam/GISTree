import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

export const Route = createFileRoute('/inbox/')({
  component: InboxPage,
})

interface Message {
  id: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    studentId: string;
  };
}

function InboxPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMessages()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const fetchMessages = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/messages`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="p-4">Please login to view your inbox.</div>
  }

  if (isLoading) {
    return <div className="p-4">Loading messages...</div>
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-green-800">Inbox</h1>

      {messages.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No messages yet.</p>
          <p className="text-gray-400">Share your profile to receive messages!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <div key={message.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-3">
                <span className="font-semibold text-lg">
                  {message.isAnonymous ? 'Anonymous' : message.sender.name}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(message.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
              <div className="mt-4 flex justify-end">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

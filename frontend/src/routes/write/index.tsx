import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { UserSearch } from '../../components/UserSearch'
import { useAuth } from '../../context/AuthContext'

export const Route = createFileRoute('/write/')({
  component: WritePage,
})

function WritePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedUser, setSelectedUser] = useState<{ id: string, name: string, studentId: string } | null>(null)
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSelectUser = (user: { id: string, name: string, studentId: string }) => {
    setSelectedUser(user)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          receiverStudentId: selectedUser.studentId,
          receiverName: selectedUser.name,
          content,
          isAnonymous,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to send message')
      }

      setStatus('success')
      setContent('')
      setTimeout(() => {
        navigate({ to: '/inbox' })
      }, 2000)
    } catch (error: any) {
      setStatus('error')
      setErrorMessage(error.message)
    }
  }

  if (!user) {
    return <div className="p-4">Please login to send messages.</div>
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-green-800">Write a Message</h1>

      {!selectedUser ? (
        <div>
          <p className="mb-4 text-gray-600">Search for a friend to send a message to:</p>
          <UserSearch onSelect={handleSelectUser} />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">To: {selectedUser.name} ({selectedUser.studentId})</h2>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              Change Recipient
            </button>
          </div>

          {status === 'success' && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
              Message sent successfully! Redirecting to inbox...
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border rounded-lg h-40 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Write your warm message here..."
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mr-2 w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="anonymous" className="text-gray-700">Send Anonymously</label>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

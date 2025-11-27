import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = useAuth()
  const [mailboxProtected, setMailboxProtected] = useState(false)
  const [mailboxPassword, setMailboxPassword] = useState('')
  const [treeLocked, setTreeLocked] = useState(false)
  const [treePassword, setTreePassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  const handleSaveMailbox = async () => {
    setStatus('saving')
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await fetch(`${apiUrl}/users/me/mailbox`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isProtected: mailboxProtected, password: mailboxPassword }),
      })
      setStatus('success')
    } catch (error) {
      setStatus('error')
    }
  }

  const handleSaveTree = async () => {
    setStatus('saving')
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await fetch(`${apiUrl}/users/me/tree`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isLocked: treeLocked, password: treePassword }),
      })
      setStatus('success')
    } catch (error) {
      setStatus('error')
    }
  }

  if (!user) {
    return <div className="p-4">Please login to view profile.</div>
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-green-800">Profile Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">User Info</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Student ID:</strong> {user.studentId}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Mailbox Settings</h2>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={mailboxProtected}
            onChange={(e) => setMailboxProtected(e.target.checked)}
            className="mr-2"
          />
          <label>Protect Mailbox with Password</label>
        </div>
        {mailboxProtected && (
          <input
            type="password"
            value={mailboxPassword}
            onChange={(e) => setMailboxPassword(e.target.value)}
            placeholder="Enter Mailbox Password"
            className="w-full p-2 border rounded mb-4"
          />
        )}
        <button onClick={handleSaveMailbox} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Save Mailbox Settings
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Tree Settings</h2>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={treeLocked}
            onChange={(e) => setTreeLocked(e.target.checked)}
            className="mr-2"
          />
          <label>Lock Tree (Password Required)</label>
        </div>
        {treeLocked && (
          <input
            type="password"
            value={treePassword}
            onChange={(e) => setTreePassword(e.target.value)}
            placeholder="Enter Tree Password"
            className="w-full p-2 border rounded mb-4"
          />
        )}
        <button onClick={handleSaveTree} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Save Tree Settings
        </button>
      </div>

      {status === 'success' && <div className="mt-4 text-green-600">Settings saved successfully!</div>}
      {status === 'error' && <div className="mt-4 text-red-600">Failed to save settings.</div>}
    </div>
  )
}

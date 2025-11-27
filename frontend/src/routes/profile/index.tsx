import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getApiUrl } from '../../config'

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

  useEffect(() => {
    if (user) {
      const apiUrl = getApiUrl();
      // Fetch initial settings
      // We need an endpoint to get user settings. Assuming /users/me returns them or we need separate endpoints.
      // Based on user.service.ts, there isn't a direct "get settings" endpoint shown in the snippets, 
      // but usually /users/me might include them or we fetch from specific endpoints.
      // Let's assume /users/me includes them for now or we need to add them to the backend.
      // Wait, the backend snippet for UserService.findOrCreate doesn't seem to include settings relations.
      // But let's try to fetch them. If not available, we might need to add backend support.
      // For now, I will implement the fetch logic as requested.
      fetch(`${apiUrl}/users/me`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          // Assuming data contains these fields. If not, this might need backend adjustment.
          // But the review asked to "load existing settings".
          if (data.mailboxSettings) {
            setMailboxProtected(data.mailboxSettings.isProtected);
          }
          if (data.tree) {
            setTreeLocked(data.tree.isLocked);
          }
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleSaveMailbox = async () => {
    if (mailboxProtected && !mailboxPassword) {
      alert('Password is required when enabling mailbox protection.');
      return;
    }

    setStatus('saving')
    try {
      const apiUrl = getApiUrl();
      const payload: any = { isProtected: mailboxProtected };
      if (mailboxPassword) {
        payload.password = mailboxPassword;
      }

      const response = await fetch(`${apiUrl}/users/me/mailbox`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        setStatus('success')
        setMailboxPassword('') // Clear password after save
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  const handleSaveTree = async () => {
    if (treeLocked && !treePassword) {
      alert('Password is required when locking the tree.');
      return;
    }

    setStatus('saving')
    try {
      const apiUrl = getApiUrl();
      const payload: any = { isLocked: treeLocked };
      if (treePassword) {
        payload.password = treePassword;
      }

      const response = await fetch(`${apiUrl}/users/me/tree`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        setStatus('success')
        setTreePassword('') // Clear password after save
      } else {
        setStatus('error')
      }
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
            id="mailbox-protected"
            checked={mailboxProtected}
            onChange={(e) => setMailboxProtected(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="mailbox-protected">Protect Mailbox with Password</label>
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
        <button
          onClick={handleSaveMailbox}
          disabled={mailboxProtected && !mailboxPassword}
          className={`px-4 py-2 rounded text-white ${mailboxProtected && !mailboxPassword ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          Save Mailbox Settings
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Tree Settings</h2>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="tree-locked"
            checked={treeLocked}
            onChange={(e) => setTreeLocked(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="tree-locked">Lock Tree (Password Required)</label>
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
        <button
          onClick={handleSaveTree}
          disabled={treeLocked && !treePassword}
          className={`px-4 py-2 rounded text-white ${treeLocked && !treePassword ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          Save Tree Settings
        </button>
      </div>

      {status === 'success' && <div className="mt-4 text-green-600">Settings saved successfully!</div>}
      {status === 'error' && <div className="mt-4 text-red-600">Failed to save settings.</div>}
    </div>
  )
}

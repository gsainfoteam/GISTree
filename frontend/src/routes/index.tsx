// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

import { useAuth } from '../context/AuthContext'


function Home() {
  const { user, isLoading, login } = useAuth()

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-4xl font-bold mb-8 text-green-700">🎄 GISTree</h1>
        <p className="text-xl mb-8 text-gray-600">
          Send warm year-end messages to your GIST friends!
        </p>
        <button
          onClick={login}
          className="bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-green-700 transition shadow-lg"
        >
          Login with GIST IdP
        </button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}!</h1>
      <p>Your Student ID: {user.studentId}</p>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">My Tree</h2>
        <div className="bg-gray-100 p-8 rounded-lg text-center h-64 flex items-center justify-center">
          Tree Visualization Placeholder
        </div>
      </div>
    </div>
  )
}

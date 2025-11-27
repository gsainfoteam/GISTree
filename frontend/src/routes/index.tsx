// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../context/AuthContext'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { user, isLoading, login } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="mb-8 inline-block animate-bounce-slow">
            <span className="text-6xl">🎄</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 tracking-tight">
            GISTree
          </h1>

          <p className="text-xl md:text-2xl mb-10 text-slate-600 leading-relaxed font-light">
            Share warmth and joy with your GIST friends.<br />
            Plant a message, grow a memory.
          </p>

          <button
            onClick={login}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-full opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative flex items-center gap-2">
              Login with GIST IdP
              <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          <p className="mt-6 text-sm text-slate-400">
            Secure login via GIST Identity Provider
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome, {user.name}! 👋</h1>
            <p className="text-slate-500 mt-1">Student ID: {user.studentId}</p>
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
            🎅
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-3 text-green-800 flex items-center gap-2">
              <span>🌲</span> My Tree
            </h2>
            <p className="text-slate-600 mb-4">Check your tree and see who sent you messages!</p>
            <div className="bg-white/60 p-4 rounded-lg text-center h-48 flex items-center justify-center border border-green-100/50">
              <span className="text-green-600/50 font-medium">Tree Visualization Coming Soon</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-blue-800 mb-1">📬 Recent Messages</h3>
              <p className="text-sm text-blue-600">You have 0 new messages</p>
            </div>

            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-amber-800 mb-1">✨ Collect Ornaments</h3>
              <p className="text-sm text-amber-600">Send messages to earn decorations!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../context/AuthContext'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { user, isLoading } = useAuth()

  const handleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL;
    if (!backendUrl) {
      console.error('VITE_API_BASE_URL is not defined');
      return;
    }
    const redirectUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `${backendUrl}/auth/login?redirect_url=${redirectUrl}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A472A]"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 relative overflow-hidden bg-[#F8F9FA]">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1A472A] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C41E3A] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-[#D4AF37] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="mb-6 inline-block animate-bounce-slow">
            <span className="text-7xl filter drop-shadow-lg">🎄</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6 text-[#1A472A] tracking-tight drop-shadow-sm">
            GISTree
          </h1>

          <p className="text-xl md:text-3xl mb-12 text-[#2C3E50] leading-relaxed font-light font-serif">
            Share warmth and joy with your GIST friends.<br />
            <span className="text-[#C41E3A] font-medium">Plant a message, grow a memory.</span>
          </p>

          <button
            onClick={handleLogin}
            className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white transition-all duration-300 bg-[#C41E3A] rounded-full hover:bg-[#A01830] focus:outline-none focus:ring-4 focus:ring-[#C41E3A]/30 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            <span className="relative flex items-center gap-3">
              Login with GIST IdP
              <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          <p className="mt-8 text-sm text-[#5D6D7E] font-medium">
            🔒 Secure login via GIST Identity Provider
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#1A472A]/5 to-[#C41E3A]/5 rounded-bl-full pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-10 relative z-10">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#1A472A]">Welcome, {user.name}! 👋</h1>
            <p className="text-[#5D6D7E] mt-2 text-lg">Student ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-[#2C3E50]">{user.studentId}</span></p>
          </div>
          <div className="mt-4 md:mt-0 h-16 w-16 bg-[#F8F9FA] rounded-full flex items-center justify-center text-3xl shadow-inner border border-gray-100">
            🎅
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* My Tree Section */}
          <div className="group bg-gradient-to-br from-[#1A472A]/5 to-[#1A472A]/10 p-8 rounded-2xl border border-[#1A472A]/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <h2 className="text-2xl font-serif font-bold mb-4 text-[#1A472A] flex items-center gap-3">
              <span className="text-3xl">🌲</span> My Tree
            </h2>
            <p className="text-[#2C3E50] mb-6 leading-relaxed">Check your tree and see who sent you messages! Decorate it with ornaments you collect.</p>
            <div className="bg-white/80 p-6 rounded-xl text-center h-56 flex flex-col items-center justify-center border border-[#1A472A]/10 shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-5xl mb-3 opacity-50">🎄</span>
              <span className="text-[#1A472A] font-medium">Tree Visualization Coming Soon</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Recent Messages */}
            <div className="bg-gradient-to-br from-[#3498DB]/5 to-[#3498DB]/10 p-8 rounded-2xl border border-[#3498DB]/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
              <h3 className="text-xl font-serif font-bold text-[#2980B9] mb-2 flex items-center gap-2">
                <span>📬</span> Recent Messages
              </h3>
              <p className="text-[#34495E] group-hover:text-[#2980B9] transition-colors">You have 0 new messages waiting for you.</p>
            </div>

            {/* Collect Ornaments */}
            <div className="bg-gradient-to-br from-[#D4AF37]/5 to-[#D4AF37]/10 p-8 rounded-2xl border border-[#D4AF37]/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
              <h3 className="text-xl font-serif font-bold text-[#B7950B] mb-2 flex items-center gap-2">
                <span>✨</span> Collect Ornaments
              </h3>
              <p className="text-[#7D6608] group-hover:text-[#B7950B] transition-colors">Send messages to friends to earn rare decorations for your tree!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

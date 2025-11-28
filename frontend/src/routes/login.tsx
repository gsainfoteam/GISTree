import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

import { getApiUrl } from '../config';

function LoginPage() {
  const handleLogin = () => {
    const apiUrl = getApiUrl();
    const redirectUrl = encodeURIComponent(
      `${window.location.pathname}${window.location.search}${window.location.hash}` || '/',
    );

    window.location.href = `${apiUrl}/auth/login?redirect_url=${redirectUrl}`;
  };

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
          onClick={handleLogin}
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

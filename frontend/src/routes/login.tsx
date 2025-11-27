import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/login';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-4xl font-bold mb-8 text-green-700">🎄 GISTree</h1>
      <p className="text-xl mb-8 text-gray-600">
        Send warm year-end messages to your GIST friends!
      </p>
      <button
        onClick={handleLogin}
        className="bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-green-700 transition shadow-lg"
      >
        Login with GIST IdP
      </button>
    </div>
  )
}

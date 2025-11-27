// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/login';
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to GISTree</h1>
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Login with GIST
      </button>
    </div>
  )
}

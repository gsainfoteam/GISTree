import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/failed')({
  component: AuthFailed,
})

function AuthFailed() {
  const searchParams = new URLSearchParams(window.location.search)
  const reason = searchParams.get('reason')

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Login Failed</h1>
      <p className="mb-4">Reason: {reason || 'Unknown error'}</p>
      <Link to="/" className="text-blue-600 hover:underline">
        Go back home
      </Link>
    </div>
  )
}

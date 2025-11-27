import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Cookie is set by the server (HttpOnly)
    // Just redirect to the next page
    navigate({ to: '/' })
  }, [navigate])

  return <div>Logging in...</div>
}

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const returnUrl = searchParams.get('returnUrl') || '/'

    // Cookie is set by the server (HttpOnly)
    navigate({ to: returnUrl as any })
  }, [navigate])

  return <div>Logging in...</div>
}

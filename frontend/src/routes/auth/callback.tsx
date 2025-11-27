import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect_url: typeof search.redirect_url === 'string' ? search.redirect_url : '/',
  }),
})

function AuthCallback() {
  const { redirect_url } = Route.useSearch()
  const navigate = useNavigate()

  useEffect(() => {
    // Cookie is set by the server (HttpOnly)
    // Just redirect to the next page
    const target = redirect_url?.startsWith('/') ? redirect_url : '/'
    navigate({ to: target })
  }, [navigate, redirect_url])

  return <div>Logging in...</div>
}

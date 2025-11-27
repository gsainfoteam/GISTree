import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect_url: typeof search.redirect_url === 'string' ? search.redirect_url : '/',
    access_token: typeof search.access_token === 'string' ? search.access_token : undefined,
  }),
})

function AuthCallback() {
  const { redirect_url, access_token } = Route.useSearch()
  const navigate = useNavigate()

  useEffect(() => {
    if (access_token) {
      localStorage.setItem('access_token', access_token);
    }

    // Redirect to the next page
    const target = redirect_url?.startsWith('/') ? redirect_url : '/'
    navigate({ to: target })
  }, [navigate, redirect_url, access_token])

  return <div>Logging in...</div>
}

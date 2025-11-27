import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const token = searchParams.get('token')

    if (token) {
      localStorage.setItem('accessToken', token)
      // Redirect to send-message or home
      navigate({ to: '/send-message' })
    } else {
      // Handle error or missing token
      navigate({ to: '/' })
    }
  }, [navigate])

  return <div>Logging in...</div>
}

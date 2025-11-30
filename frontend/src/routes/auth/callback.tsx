import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
import { setAccessToken } from '../../utils/api'

/**
 * /auth/callback 라우트
 * 
 * 이 페이지는 로그인 성공 후 백엔드에서 리다이렉트되는 페이지입니다.
 * 
 * 동작 과정:
 * 1. 백엔드가 이 페이지로 리다이렉트하면서 URL에 access_token과 redirect_url을 포함시킵니다
 * 2. 이 페이지에서 access_token을 localStorage에 저장합니다
 * 3. redirect_url로 이동합니다 (없으면 홈으로)
 */
export const Route = createFileRoute('/auth/callback')({
  component: CallbackComponent,
  // URL 파라미터 검증 (타입 안전성을 위해)
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect_url: (search.redirect_url as string) || undefined,
      access_token: (search.access_token as string) || undefined,
    }
  },
})

function CallbackComponent() {
  const navigate = useNavigate()
  // URL에서 파라미터 가져오기 (예: ?redirect_url=/login&access_token=abc123)
  const search = useSearch({ from: '/auth/callback' })

  useEffect(() => {
    const { redirect_url, access_token } = search

    // 1. access_token이 있으면 localStorage에 저장
    if (access_token) {
      setAccessToken(access_token)
      console.log('토큰이 저장되었습니다.')
    }

    // 2. redirect_url이 있으면 그 경로로 이동, 없으면 홈(/)으로 이동
    const redirectPath = redirect_url ? decodeURIComponent(redirect_url) : '/'
    navigate({ to: redirectPath })
  }, [search, navigate])

  // 로딩 중 표시 (이 페이지는 매우 빠르게 다른 페이지로 이동하므로 거의 보이지 않습니다)
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  )
}

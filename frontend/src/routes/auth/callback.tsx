import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
import { setAccessToken, apiRequest } from '../../utils/api'

/**
 * /auth/callback 라우트
 * * 이 페이지는 로그인 성공 후 백엔드에서 리다이렉트되는 페이지입니다.
 * * 동작 과정:
 * 1. 백엔드가 이 페이지로 리다이렉트하면서 URL에 access_token과 redirect_url을 포함시킵니다
 * 2. 이 페이지에서 access_token을 localStorage에 저장합니다
 * 3. 사용자 정보를 조회하여 본인의 트리 페이지(/tree/{id}) 또는 원래 가려던 페이지로 이동합니다.
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
    const handleLoginCallback = async () => {
      console.log('Callback Search Params:', search) // 디버깅용 로그
      const { redirect_url, access_token } = search

      // 1. access_token이 있으면 localStorage에 저장
      if (access_token) {
        setAccessToken(access_token)
        console.log('토큰이 저장되었습니다.')

        try {
          // 2. 토큰을 이용해 내 정보(ID)를 조회
          // 백엔드 엔드포인트: /users/me
          const user = await apiRequest<{ id: string }>('/users/me')
          console.log('User Info:', user)

          // 3. 이동할 경로 결정
          // redirect_url이 있고 홈('/')이 아니라면 그곳으로 이동 (친구 트리 방문 등)
          // 그 외의 경우(단순 로그인)에는 내 트리 페이지로 이동
          if (redirect_url && redirect_url !== '/' && redirect_url !== '') {
            console.log('Redirecting to:', redirect_url)
            navigate({ to: decodeURIComponent(redirect_url) })
          } else {
            console.log('Redirecting to user tree:', user.id)
            navigate({ to: `/tree/${user.id}` })
          }
          return

        } catch (error) {
          console.error('사용자 정보 조회 실패:', error)
          // 에러 발생 시 안전하게 홈으로 이동
          navigate({ to: '/' })
          return
        }
      }

      // 토큰이 없는 경우 홈으로 이동
      console.warn('No access token found, redirecting to home')
      navigate({ to: '/' })
    }

    handleLoginCallback()
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
import { createFileRoute } from '@tanstack/react-router'
import logoSvg from '../assets/logo.svg'
import { getApiUrl } from '../utils/api'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const handleLogin = () => {
    const apiUrl = getApiUrl();
    // 로그인 페이지에서는 항상 홈(/)으로 리다이렉트
    // 다른 페이지에서 로그인이 필요할 때만 원래 경로로 돌아가도록 설정
    const redirectUrl = encodeURIComponent('/');
    window.location.href = `${apiUrl}/auth/login?redirect_url=${redirectUrl}`;
  };

  return (
  <div className="flex flex-col gap-[30px] items-center justify-center h-screen">
    <img src={logoSvg} alt="logo" className="w-[300px] h-auto" />
    <button 
        className="py-[7px] px-[20px] font-bold text-medium justify-center items-center gap-[10px] rounded-[10px] border-[1px] border-black"
        onClick={handleLogin}
    >
      Login with GIST account
    </button>
  </div>
  )
}

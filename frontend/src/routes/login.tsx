import { createFileRoute } from '@tanstack/react-router'
import logoSvg from '../assets/logo.svg'


export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

export const getApiUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`;
};

function RouteComponent() {
  const handleLogin = () => {
    const apiUrl = getApiUrl();
    const redirectUrl = encodeURIComponent(
      `${window.location.pathname}${window.location.search}${window.location.hash}` || '/',
    );
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

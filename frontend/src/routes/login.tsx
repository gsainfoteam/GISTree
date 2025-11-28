import { createFileRoute } from '@tanstack/react-router'
import logoSvg from '../assets/logo.svg'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="flex flex-col gap-[30px] items-center justify-center h-screen">
    <img src={logoSvg} alt="logo" className="w-[300px] h-auto" />
    <button 
        className="py-[7px] px-[20px] font-bold text-medium justify-center items-center gap-[10px] rounded-[10px] border-[1px] border-black"
    >
        Login with GIST account
    </button>
    </div>
}

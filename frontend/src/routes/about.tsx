// /about 경로에서 보여줄 페이지.
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>/about 페이지</div>
}

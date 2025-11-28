import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/postMsg')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/postMsg"!</div>
}

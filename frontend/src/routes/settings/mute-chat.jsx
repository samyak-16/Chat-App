import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/mute-chat')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/settings/mute-chat"!</div>
}

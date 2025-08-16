import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/nickname')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/settings/nickname"!</div>;
}

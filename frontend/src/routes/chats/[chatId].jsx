import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/chats/[chatId]')({
  component: RouteComponent,
});
function RouteComponent() {
  return <div>Hello "/chats/[chatId]"!</div>;
}

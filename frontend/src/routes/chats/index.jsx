import { createFileRoute } from '@tanstack/react-router';
import ChatPagee from '@/pages/chat/ChatPage';

export const Route = createFileRoute('/chats/')({
  component: ChatPagee,
});

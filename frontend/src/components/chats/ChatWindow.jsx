import { useEffect, useRef, useState } from 'react';
import ChatHeader from './ChatHeader';
import Message from './Message';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getMessages } from '@/api/message.api';
import { getSocket } from '@/components/ui/lib/socket';
import { useChatStatus } from '@/store/useChatStatus';

const ChatWindow = ({ chat, authUserId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const socket = getSocket();
  const { typingStatus } = useChatStatus();

  // Fetch messages for this chat
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const data = await getMessages(chat._id); // your api util
        setMessages(data || []);
      } catch (err) {
        console.error('Error loading messages', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    // Join chat room via socket
    socket.emit('join', { chatId: chat._id });

    // Listen for new incoming messages
    socket.on('new_message', (newMsgs) => {
      if (!Array.isArray(newMsgs)) return;
      // append messages (backend may send array)
      setMessages((prev) => [...prev, ...newMsgs]);
    });

    return () => {
      socket.emit('leave', { chatId: chat._id });
      socket.off('new_message');
    };
  }, [chat._id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingStatus[chat._id]]);

  return (
    <div className="flex flex-col h-full">
      {/* Top Header - Fixed height */}
      <div className="flex-shrink-0">
        <ChatHeader chat={chat} authUserId={authUserId} />
      </div>

      {/* Messages List - Scrollable area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-3 chat-messages" ref={scrollRef}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="loading-spinner w-8 h-8 mx-auto mb-2"></div>
                <p className="text-gray-500">Loading messages...</p>
              </div>
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <Message
                key={msg._id}
                message={msg}
                authUserId={authUserId}
                participants={chat.participants}
                isGroup={chat.isGroup}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          <TypingIndicator 
            isTyping={typingStatus[chat._id]} 
            typingUsers={['Someone']} // This could be enhanced to show actual typing users
          />
        </ScrollArea>
      </div>

      {/* Input Box - Fixed height */}
      <div className="flex-shrink-0">
        <MessageInput chatId={chat._id} />
      </div>
    </div>
  );
};

export default ChatWindow;

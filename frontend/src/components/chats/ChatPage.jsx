import { useEffect, useState } from 'react';
import { ChatList } from './ChatList';
import ChatWindow from './ChatWindow';
import { getAllChatsForUser } from '@/api/chat.api';
import { useAuth } from '@/store/useAuth';
import { initSocket } from '@/components/ui/lib/socket';
import { useChatStatus } from '@/store/useChatStatus';
import './ChatPage.css';

export const ChatPage = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const { initSocketListeners, setCurrentUserOnline } = useChatStatus();

  // ✅ wait until Zustand rehydrates before doing anything
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    const unsub = useAuth.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // In case hydration is already done
    if (useAuth.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return unsub;
  }, []);

  // 1️⃣ Initialize global socket & listeners (only after hydration + user exists)
  useEffect(() => {
    if (!isHydrated || !user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = initSocket(token);
    
    // Set current user as online immediately when socket connects
    setCurrentUserOnline(user._id);
    
    // Initialize socket listeners for status updates
    initSocketListeners(socket);

    return () => {
      socket.disconnect();
    };
  }, [user, isHydrated, setCurrentUserOnline]);

  // 2️⃣ Fetch all chats for logged-in user
  useEffect(() => {
    if (!isHydrated || !user) return;

    const fetchChats = async () => {
      try {
        const data = await getAllChatsForUser();
        setChats(data || []);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();
  }, [user, isHydrated]);

  // ⏳ Show a loader until hydration finishes
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 chat-container">
      {/* Left Column: Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 shadow-sm chat-list">
        <ChatList
          chats={chats}
          activeChatId={selectedChat?._id}
          onSelectChat={setSelectedChat}
          authUserId={user?._id}
        />
      </div>

      {/* Right Column: Chat Window */}
      <div className="flex-1 bg-white chat-window">
        {selectedChat ? (
          <ChatWindow chat={selectedChat} authUserId={user?._id} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose from your conversations to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

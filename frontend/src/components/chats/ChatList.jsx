import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import ChatItem from './ChatItem';

export const ChatList = ({ chats, activeChatId, onSelectChat, authUserId }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chats based on search query

  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;

    return chats.filter((chat) => {
      if (chat.isGroup) {
        // Filter by group name
        return chat.name?.toLowerCase().includes(searchQuery.toLowerCase());
      } else {
        // Private chat: find other participant nickname
        const otherUser = chat.participants.find(
          (p) => p.userId !== authUserId
        );
        return otherUser?.nickname
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
    });
  }, [chats, searchQuery, authUserId]);
  console.log('Chats are', chats); // Im getting the chats still

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-xs font-semibold">
              {filteredChats.length}
            </span>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 pr-4 py-2 bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500 focus:ring-green-500/20 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List - Scrollable area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full chat-list-scrollbar">
          {filteredChats.length > 0 ? (
            <div className="p-3">
              {filteredChats.map((chat) => (
                <ChatItem
                  key={chat._id}
                  chat={chat}
                  isActive={chat._id === activeChatId}
                  onSelect={() => onSelectChat(chat)}
                  authUserId={authUserId}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-base font-medium mb-2 text-gray-700">No conversations found</p>
              <p className="text-sm text-center text-gray-500">Try adjusting your search terms or start a new chat</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

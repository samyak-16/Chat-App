import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { HiOutlineBell } from 'react-icons/hi';
import { useChatStatus } from '@/store/useChatStatus';
import { format, formatDistanceToNow } from 'date-fns';

const ChatItem = ({ chat, isActive, onSelect, authUserId }) => {
  const { activeStatuses, typingStatus } = useChatStatus();

  // Determine display name & avatar for DMs
  const isGroup = chat.isGroup;
  let displayName = chat.name;
  let displayAvatar = ''; // fallback
  let otherUser = null;

  if (!isGroup) {
    otherUser = chat.participants.find((p) => p.userId !== authUserId);
    if (otherUser) {
      displayName = otherUser.nickname;
      displayAvatar = otherUser.avatar || '';
    }
  }

  // Get first letter for avatar fallback
  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // Last message preview
  const lastMessage = chat.lastMessage;

  const getLastMessagePreview = (message) => {
    if (!message) return '';
    const type = message.type || 'text';

    if (type.includes('image/')) return '📷 Image';
    if (type.includes('video/')) return '🎥 Video';
    if (type.includes('audio/')) return '🎵 Audio';
    if (type !== 'text' && !type.includes('image/') && !type.includes('video/') && !type.includes('audio/')) {
      return '📎 File';
    }
    
    // Text message
    if (type === 'text' || type.includes('plain')) {
      return message.content.length > 30
        ? message.content.slice(0, 30) + '...'
        : message.content;
    }
    
    return '[Message]';
  };

  const lastMessageTime = lastMessage
    ? format(new Date(lastMessage.createdAt), 'p') // e.g., 10:30 AM
    : '';

  // Typing & status
  const isTyping = typingStatus[chat._id] || false;

  // Get status information - NEVER return null
  const getStatusInfo = () => {
    if (isGroup) {
      // For group chats, show online count if any, otherwise show member count
      const onlineCount = chat.participants.filter(p => activeStatuses[p.userId] === 'online').length;
      if (onlineCount > 0) {
        return `${onlineCount} online`;
      }
      return `${chat.participants.length} members`; // Always show member count for groups
    } else {
      // For private chats, show status
      if (!otherUser) return 'offline';
      
      // Status logging removed - now using consistent global store
      
      const status = activeStatuses[otherUser.userId] || 'offline';
      
      if (status === 'online') {
        return 'online';
      } else {
        // Show last active time for offline users
        if (otherUser.lastSeen) {
          try {
            return `last seen ${formatDistanceToNow(new Date(otherUser.lastSeen), { addSuffix: true })}`;
          } catch (error) {
            return 'offline';
          }
        }
        return 'offline';
      }
    }
  };

  // Muted chat
  const currentUser = chat.participants.find((p) => p.userId === authUserId);
  const isMuted = currentUser?.mutedChats?.includes(chat._id);

  return (
    <div
      onClick={() => onSelect(chat)}
      className={`flex items-center p-4 cursor-pointer transition-all duration-200 chat-item ${
        isActive 
          ? 'active border-l-4 border-blue-500 shadow-sm' 
          : 'border-l-4 border-transparent hover:border-l-gray-300'
      }`}
      style={{
        backgroundColor: isActive ? '#eff6ff' : '#ffffff'
      }}
    >
      {/* Avatar + online status */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-12 h-12">
          {displayAvatar ? (
            <img src={displayAvatar} alt={displayName} />
          ) : (
            <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
              {getFirstLetter(displayName)}
            </div>
          )}
        </Avatar>
        {!isGroup && otherUser && activeStatuses[otherUser.userId] === 'online' && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full online-status"></div>
        )}
      </div>

      {/* Chat Info */}
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className={`font-semibold truncate text-sm ${
            isActive ? 'text-gray-900' : 'text-gray-900'
          }`}>{displayName}</h3>
          <span className={`text-xs flex-shrink-0 ml-2 ${
            isActive ? 'text-gray-700' : 'text-gray-500'
          }`}>{lastMessageTime}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <p className={`text-sm truncate ${
              isTyping 
                ? 'text-green-600 italic' 
                : isActive 
                  ? 'text-gray-700' 
                  : 'text-gray-600'
            }`}>
              {isTyping ? 'typing...' : getLastMessagePreview(lastMessage)}
            </p>
            {/* Status info below message - ALWAYS show something */}
            {!isTyping && (
              <p className="text-xs text-gray-500 truncate mt-1">
                {getStatusInfo()}
              </p>
            )}
          </div>
          {isMuted && (
            <HiOutlineBell className={`ml-2 flex-shrink-0 ${
              isActive ? 'text-gray-500' : 'text-gray-400'
            }`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;

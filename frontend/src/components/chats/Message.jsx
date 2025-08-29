// src/components/chat/Message.jsx
import { Avatar } from '@/components/ui/avatar';
import { format } from 'date-fns';

const Message = ({ message, authUserId, participants, isGroup }) => {
  const isOwnMessage = message.senderId === authUserId;
  
  // Get sender info from participants
  const sender = participants.find(p => p.userId === message.senderId);
  const senderName = sender?.nickname || 'Unknown';
  const senderAvatar = sender?.avatar || '';

  // Get first letter for avatar fallback
  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch {
      return '--:--';
    }
  };

  const getMessageContent = () => {
    const type = message.type || 'text';
    
    // Check if it's a file type based on MIME type
    if (type.includes('image/')) {
      return (
        <img 
          src={message.content} 
          alt="Shared image" 
          className="max-w-xs max-h-64 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(message.content, '_blank')}
        />
      );
    }
    
    if (type.includes('video/')) {
      return (
        <video 
          src={message.content} 
          controls
          className="max-w-xs max-h-64 rounded-lg"
        >
          Your browser does not support the video tag.
        </video>
      );
    }
    
    if (type.includes('audio/')) {
      return (
        <audio 
          src={message.content} 
          controls
          className="w-full"
        >
          Your browser does not support the audio tag.
        </audio>
      );
    }
    
    // For other file types (documents, etc.)
    if (type !== 'text' && !type.includes('image/') && !type.includes('video/') && !type.includes('audio/')) {
      return (
        <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition-colors">
          <span className="text-lg">📎</span>
          <div className="flex flex-col">
            <span className="text-sm font-medium">File attachment</span>
            <span className="text-xs text-gray-500">{type}</span>
          </div>
        </div>
      );
    }
    
    // Default text message
    return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
  };

  return (
    <div className={`flex items-end mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for other messages */}
      {!isOwnMessage && (
        <div className="flex flex-col items-center mr-2">
          <Avatar className="w-8 h-8 mb-1">
            {senderAvatar ? (
              <img src={senderAvatar} alt={senderName} />
            ) : (
              <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                {getFirstLetter(senderName)}
              </div>
            )}
          </Avatar>
          {isGroup && (
            <span className="text-xs text-gray-500 max-w-16 truncate">
              {senderName}
            </span>
          )}
        </div>
      )}

      {/* Message Bubble */}
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-3 py-2 rounded-lg shadow-sm message-bubble ${
            isOwnMessage
              ? 'bg-green-500 text-white rounded-br-sm'
              : 'bg-gray-200 text-gray-900 rounded-bl-sm'
          }`}
        >
          {getMessageContent()}
          
          {/* Timestamp */}
          <div className={`text-xs mt-1 ${
            isOwnMessage ? 'text-green-100' : 'text-gray-500'
          }`}>
            {formatTime(message.createdAt)}
          </div>
        </div>
      </div>

      {/* Avatar for own messages */}
      {isOwnMessage && (
        <div className="flex flex-col items-center ml-2">
          <Avatar className="w-8 h-8 mb-1">
            {senderAvatar ? (
              <img src={senderAvatar} alt={senderName} />
            ) : (
              <div className="w-full h-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
                {getFirstLetter(senderName)}
              </div>
            )}
          </Avatar>
        </div>
      )}
    </div>
  );
};

export default Message;

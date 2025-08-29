import React from 'react';

const TypingIndicator = ({ isTyping, typingUsers = [] }) => {
  if (!isTyping || typingUsers.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 p-3 text-gray-500">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
      </div>
      <span className="text-sm">
        {typingUsers.length === 1 
          ? `${typingUsers[0]} is typing...`
          : `${typingUsers.join(', ')} are typing...`
        }
      </span>
    </div>
  );
};

export default TypingIndicator;

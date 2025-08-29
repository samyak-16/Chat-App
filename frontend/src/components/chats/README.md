# Chat Components Documentation

This directory contains all the chat-related components for the messaging application.

## Components Overview

### 1. ChatPage.jsx
**Main container component** that orchestrates the entire chat interface.

**Features:**
- Fetches all chats for the logged-in user
- Waits for Zustand hydration before loading data
- Manages socket connection and listeners
- Displays chat list and chat window side by side
- Shows placeholder when no chat is selected

**Props:** None (uses Zustand store for user data)

### 2. ChatList.jsx
**Left sidebar component** that displays all available chats.

**Features:**
- Searchable chat list
- Real-time online/offline status
- Last message preview with timestamp
- Typing indicators
- Muted chat indicators
- Active chat highlighting

**Props:**
- `chats`: Array of chat objects
- `activeChatId`: ID of currently selected chat
- `onSelectChat`: Function to handle chat selection
- `authUserId`: Current user's ID

### 3. ChatItem.jsx
**Individual chat item** in the chat list.

**Features:**
- Profile picture/avatar display
- Online status indicator (green dot)
- Chat name (group name or participant name)
- Last message preview
- Timestamp
- Typing indicator
- Muted indicator

**Props:**
- `chat`: Chat object with all details
- `isActive`: Boolean for active state
- `onSelect`: Function to select this chat
- `authUserId`: Current user's ID

### 4. ChatWindow.jsx
**Right panel component** that displays the selected chat conversation.

**Features:**
- Message history display
- Real-time message updates via WebSocket
- Auto-scroll to bottom on new messages
- Loading states
- Empty state when no messages
- Typing indicators

**Props:**
- `chat`: Selected chat object
- `authUserId`: Current user's ID

### 5. ChatHeader.jsx
**Header component** for the chat window.

**Features:**
- Chat name and avatar
- Online/offline status for private chats
- Member count for group chats
- Dropdown menu with chat options
- Participant list in dropdown

**Props:**
- `chat`: Chat object
- `authUserId`: Current user's ID

### 6. Message.jsx
**Individual message bubble** component.

**Features:**
- Different styling for own vs others' messages
- Sender avatar and name (for group chats)
- Message content (text, images, files)
- Timestamp
- Responsive design

**Props:**
- `message`: Message object
- `authUserId`: Current user's ID
- `participants`: Array of chat participants
- `isGroup`: Boolean indicating if it's a group chat

### 7. MessageInput.jsx
**Input component** for sending messages.

**Features:**
- Text input with Enter key support
- Send button
- Attachment and emoji buttons (placeholders)
- Typing indicators via WebSocket
- Loading states during send

**Props:**
- `chatId`: ID of the current chat

### 8. TypingIndicator.jsx
**Component** that shows when someone is typing.

**Features:**
- Animated dots
- User names display
- Automatic show/hide

**Props:**
- `isTyping`: Boolean for typing state
- `typingUsers`: Array of typing user names

## Data Flow

1. **ChatPage** initializes and fetches chats
2. **ChatList** displays all chats with search functionality
3. **ChatItem** shows individual chat previews
4. When a chat is selected, **ChatWindow** loads messages
5. **Message** components render individual messages
6. **MessageInput** allows sending new messages
7. **WebSocket** events update the UI in real-time

## Socket Events

- `message:received` - New message received
- `user:online` - User came online
- `user:offline` - User went offline
- `typing` - User started typing
- `stopTyping` - User stopped typing

## Styling

All components use TailwindCSS with a modern, clean design:
- Blue accent colors for active states
- Gray scale for neutral elements
- Rounded corners and subtle shadows
- Responsive design
- Smooth transitions and hover effects

## State Management

- **Zustand** for global state (user, chat status)
- **Local state** for component-specific data
- **WebSocket** for real-time updates

## API Integration

- `getAllChatsForUser()` - Fetch user's chats
- `getMessages(chatId)` - Fetch chat messages
- `sendMessage(chatId, content)` - Send new message

## Usage Example

```jsx
import { ChatPage } from './components/chats/ChatPage';

function App() {
  return (
    <div className="h-screen">
      <ChatPage />
    </div>
  );
}
```

## Dependencies

- React 19+
- Zustand (state management)
- Socket.io-client (real-time communication)
- TailwindCSS (styling)
- Radix UI (UI components)
- date-fns (date formatting)
- Lucide React (icons)

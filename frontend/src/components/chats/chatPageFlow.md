# 📌 Chat Page Flow & Layout

This document explains the **state/prop flow** and the **layout structure** of the Chat Page.

---

## 🔹 Layout Overview

The chat page is a **two-column layout**:

- **Left Column (ChatList)**
  - Shows a list of all chats (DMs / groups).
  - Includes **search bar** at the top.
  - Highlights the **active chat**.
  - Each chat row = `ChatItem`.

- **Right Column (ChatWindow)**
  - Shows the currently selected chat.
  - Contains:
    - **ChatHeader** (chat name, participants, status).
    - **MessageList** (all messages).
    - **Typing indicator**.
    - **MessageInput** (box to send new message).

---

## 🔹 Component Roles & Flow

### 1. ChatPage (Parent)

- **Layout:** Splits screen into **ChatList (left)** and **ChatWindow (right)**.
- **State:**
  - `chats` → List of all chats (from backend).
  - `selectedChat` → Chat currently opened.
- **Props Passed:**
  - `chats`, `activeChatId`, `onSelectChat` → To `ChatList`.
  - `chat` → To `ChatWindow`.

---

### 2. ChatList (Left Column)

- **Layout:** Vertical list with search on top → list of `ChatItem`s below.
- **Props:**
  - `chats` → Chat objects.
  - `activeChatId` → ID of the currently selected chat.
  - `onSelectChat(chat)` → Callback to open a chat.
- **State:**
  - `searchQuery` → Current text in search input.
  - `searchResults` → Filtered chats.
- **Flow:**
  - Maps through chats → renders multiple `ChatItem`s.
  - When a `ChatItem` is clicked → calls `onSelectChat(chat)`.

---

### 3. ChatItem (Single Row)

- **Layout:** Small row showing:
  - Profile picture / group icon.
  - Chat name (or user name).
  - Last message preview.
  - Timestamp.
- **Props:**
  - `chat` → Data for that row.
  - `onSelect` → Function to select this chat.
- **Flow:**
  - On click → calls `onSelect(chat)` which updates `ChatPage → selectedChat`.

---

### 4. ChatWindow (Right Column)

- **Layout:**
 |ChatHeader|
 |MessageList(scrollable)|
 |-Messages|
 |-Typing Indicator|
 |MessageInput(textBox + send btn)|

     - **Props:**
- `chat` → The currently selected chat.
- **State:**
- `messages` → All messages in this chat.
- `isTyping` → Typing status.
- **Flow:**
- Fetches messages when `chat` changes.
- Renders chat header, messages, and input.
- Handles sending messages + typing indicator.

---

## 🔹 Flow Summary
1. **ChatPage** fetches `chats` and manages `selectedChat`.  
2. **ChatList** displays all chats; clicking a chat → triggers `onSelectChat(chat)`.  
3. **ChatPage** updates `selectedChat`.  
4. **ChatWindow** renders the `selectedChat` (header, messages, typing, input).  
5. **Auth user** is accessed via Zustand store → not passed as props.

---

## ✅ Key Design Decisions
- **Single Source of Truth**: `selectedChat` lives only in `ChatPage`.  
- **Global Auth State**: Managed by Zustand (`useAuth`).  
- **Clean Layout**: Two-column design keeps UI intuitive (left = navigation, right = detail).  

      

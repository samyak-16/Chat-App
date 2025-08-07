# 📩 Real-Time Message Sending Flow (WebSocket + REST)

This document explains how messages are sent, stored, and delivered in a real-time chat app using REST API, Socket.IO, JWT, Redis, and MongoDB.

---

## 1. 🧠 Overview

- Clients send messages using a REST API.
- Messages are stored in MongoDB as separate documents.
- Socket.IO is used to instantly deliver messages to all users in a chat.
- Redis tracks user online status and multiple socket connections.

---

## 2. 🔐 WebSocket Connection with JWT

Clients connect to the WebSocket server using a JWT token:

```js
io('ws://your-server.com', {
  auth: {
    token: "user's_jwt_token",
  },
});
```

# On the Server :

```js
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  const user = jwt.verify(token, process.env.JWT_SECRET);
  socket.user = user;
  next();
});
```

This authenticates the socket and makes socket.user available in connection.

## 3.🔌 On Socket Connection

When a new socket connects :

```js
io.on('connection', async (socket) => {
  const userId = socket.user.userId;

  // 1. Map socket ID to user in Redis
  await redis.sadd(`user:${userId}:sockets`, socket.id);

  // 2. Fetch all chatIds where user is a participant
  const chats = await Chat.find({ participants: userId });

  // 3. Join the socket to all chat rooms
  chats.forEach((chat) => {
    socket.join(chat._id.toString()); // Each chat room = chatId
  });
});
```

## 4. 🧾 Message Sending (HTTP REST API)

Clients send a message using a POST request:

```
POST /api/messages
Content-Type: multipart/form-data

Fields:
- chatId
- textMessage (optional)
- files (optional)
- type: 'text' | 'image' | 'video' | 'audio'
```

In the conotroller :

```js
for (const file of files || []) {
  const message = await Message.create({
    chatId,
    senderId: userId,
    type: fileType, // based on MIME
    fileUrl: file.cloudinaryUrl,
  });

  io.to(chatId.toString()).emit('new_message', {
    _id: message._id,
    chatId: message.chatId,
    senderId: message.senderId,
    content: message.content,
    createdAt: message.createdAt,
  });
}

if (textMessage) {
  const message = await Message.create({
    chatId,
    senderId: userId,
    type: 'text',
    textMessage,
  });

  io.to(chatId.toString()).emit('new_message', {
    _id: message._id,
    chatId: message.chatId,
    senderId: message.senderId,
    content: message.textMessage,
    createdAt: message.createdAt,
  });
}
```

## 5. 📡 Message Delivery via Room Broadcasting

Each chat has its own room using the chatId as room name. <br>
<br>
We use :

```js
io.to(chatId.toString()).emit('new_message', messageData);
```

- This ensures all participants who have joined the chat (on any device) get the message.

- No need to emit manually to every user.

## 6. 📱 Multiple Devices & Online Status

- One user can have many socket connections (across devices/tabs).

- All are tracked in Redis:

```js
user:{userId}:sockets => [socketId1, socketId2, ...]
```

- When message is emitted to a room, all socket connections of all users in that room get it.

## 7. 🔍 Checking Online Status (Optional)

To check if a user is online :

```js
const socketCount = await redis.scard(`user:${userId}:sockets`);
const isOnline = socketCount > 0;
```

- You can use this to show online indicators or emit "delivered" status only if user is online .

## 8. ❌ On Disconnect

```js
io.on('disconnect', async (socket) => {
  const userId = socket.user.userId;
  await redis.srem(`user:${userId}:sockets`, socket.id);

  const socketCount = await redis.scard(`user:${userId}:sockets`);
  if (socketCount === 0) {
    // Mark user offline or notify others
  }
});
```

---

In our chat app, messages are sent using a REST API and delivered in real-time using WebSockets (Socket.IO). When a user connects to the WebSocket server, their JWT token is verified in the `io.use()` middleware. The token gives us access to the authenticated user ID, which we attach to the socket instance as `socket.user`. Once the connection is established, the server fetches all the chats that the user is a participant in, and joins the socket to those chat rooms using `socket.join(chatId)`. This way, whenever a message is sent to a chat, all connected participants in that chat (on any device) will receive the message instantly.

When the client wants to send a message, it calls a REST API endpoint (like `/api/messages`) with data such as `chatId`, `textMessage`, and/or files (like images). The backend receives the request, and for each file or text message, it creates a new `Message` document in MongoDB, associating it with the sender and chat. After saving, the server uses `io.to(chatId).emit("new_message", message)` to broadcast the message to all sockets that have joined that chat room — which includes all the users currently active in that chat.

Each message (whether text or media) is stored as a separate document in the database. This allows for flexible rendering and easy querying of messages later. The message document contains fields like `chatId`, `senderId`, `type`, `textMessage` or `fileUrl`, `createdAt`, etc. Based on the `type`, the frontend knows how to display it (text, image, video, etc.).

We use Redis to track online users and their multiple socket connections. When a user connects, their socket ID is added to a Redis set with the key `user:{userId}:sockets`. This way, if a user is connected from multiple tabs/devices, all their socket IDs are stored. On disconnect, the socket ID is removed from Redis, and if the user has no more active sockets, they’re considered offline.

To check if a user is online, we can query Redis for the number of sockets associated with that user ID. If it’s greater than zero, the user is online. This is useful for showing online indicators or triggering delivery receipts. If a user was offline when a message was sent, we could later send that message again (from DB) once the user reconnects.

The `io.on("connection")` runs for every new socket, even if the same user opens multiple tabs. Since JWT remains the same, we can extract the same user ID for each socket and repeat the same logic — subscribing that socket to all the chat rooms the user is involved in. This ensures the real-time behavior works across all devices and tabs.

So in short: REST API is used to send the message to the backend → message is saved in DB → then broadcasted in real-time to all users in that chat room via Socket.IO → clients listening to `"new_message"` render it immediately. Redis ensures multi-device support and tracks online status.

---

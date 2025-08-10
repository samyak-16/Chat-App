# Summary: Socket.IO Concepts and Usage

## 1. `io` vs `socket`

- **`io`**  
  - The main Socket.IO server instance.  
  - Represents the entire WebSocket server.  
  - Can emit events to:  
    - All connected clients (`io.emit(...)`)  
    - Specific rooms (`io.to(room).emit(...)`)  
    - Broadcast to everyone except a particular socket (`socket.broadcast.emit(...)`)  

- **`socket`**  
  - Represents a single client connection.  
  - Exists inside the `'connection'` event callback.  
  - Used to listen or emit events **only for that specific client**.  
  - Can emit to itself (`socket.emit(...)`) or to rooms it joined (`socket.to(room).emit(...)`).

---

## 2. When does `io.on('connection')` run?

- It runs **only once per new client connection**.  
- It sets up a listener that fires whenever a client connects.  
- Inside this callback you get access to the `socket` for that client.  

---

## 3. Emitting events: `io.to(room).emit(...)` vs `socket.to(room).emit(...)`

- **`io.to(room).emit(event, data)`**  
  - Sends event to **all clients in the room**, including the sender if they are in the room.  
  - Used when server wants to broadcast to everyone in that room.

- **`socket.to(room).emit(event, data)`**  
  - Sends event to **all clients in the room except the sender socket**.  
  - Used when sender doesn't need to receive their own event (e.g., updating others about sender's action).

---

## 4. Accessing `io` and `socket` in different parts of your app

- `io` is usually **initialized once** when the server starts and then exported via a getter function.  
- `socket` is available **only inside the connection callback** (`io.on('connection', socket => {...})`).  
- For example, in your controllers where you don’t have access to `socket`, you use `io` to emit events to rooms or clients.

---

## 5. Event handlers and socket connection flow

- You define event handlers inside the `'connection'` callback, passing the `socket`.  
- These handlers register socket event listeners specific to each connected client.  
- The server only starts listening for socket connections once `io.listen()` or similar is called during server startup.

---

## 6. Summary of main points

| Concept                         | Explanation                                              |
|--------------------------------|----------------------------------------------------------|
| `io`                           | Server instance for emitting to all or rooms             |
| `socket`                       | Client instance inside connection callback                |
| `io.on('connection', socket)`  | Runs once per client connection, gives access to `socket` |
| `io.to(room).emit(...)`        | Emits to all clients in a room (including sender)         |
| `socket.to(room).emit(...)`    | Emits to all clients in room except the sender            |
| `io` in controller             | Use to emit events from outside connection callback       |
| `socket` in controller         | Not available unless passed from connection callback       |

---

## 7. Code snippets

```js
// Server setup
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Emit event only to this socket
  socket.emit('welcome', 'Hello!');

  // Emit to all in room including sender
  io.to('room1').emit('roomMessage', 'Message for all');

  // Emit to all in room except sender
  socket.to('room1').emit('roomMessage', 'Message for others');

  // Register event handler for this socket
  socket.on('chatMessage', (msg) => {
    // ...
  });
});

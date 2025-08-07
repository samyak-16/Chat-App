import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { ChatUser } from '../models/chatUser.model.js';
import { emitStatusToParticipants } from '../utils/emitStatusToParticipants.js';
import { Chat } from '../models/chat.model.js';

const redis = new Redis();
let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // JWT authentication middleware for Socket.IO connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));

    try {
      // Verify JWT and attach user data to socket object
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Forbidden'));
    }
  });

  // Connection event listener
  io.on('connection', async (socket) => {
    const userId = socket.user?.userId;
    if (!userId) {
      return;
    }
    console.log('User connected:', socket.user.email);

    // Joining to all chat room  where user is participant :

    const chats = await Chat.find({ participants: userId }).select('_id');
    if (chats) {
      chats.forEach((chat) => {
        socket.join(chat._id.toString());
      });
    }

    // 1. Check if user was already online BEFORE adding this socket ID
    // Redis SCARD returns 0 if the set doesn't exist yet
    const wasOnline = (await redis.scard(`user:${userId}:sockets`)) >= 1;

    // 2. Add current socket ID to Redis set for this user
    // Redis creates the set if it doesn't exist
    await redis.sadd(`user:${userId}:sockets`, socket.id);

    // 3. If user was NOT already online, update their status to "online"
    if (!wasOnline) {
      try {
        const user = await ChatUser.findOne({ userId });
        if (!user) return;
        await emitStatusToParticipants(userId, 'online');
        user.status = 'online';
        await user.save();
      } catch (error) {
        console.error('Error updating user status to online:', error);
      }
    }

    // Handle socket disconnect
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.user.email);

      // 4. Remove this socket ID from Redis set
      await redis.srem(`user:${userId}:sockets`, socket.id);

      // 5. Check how many sockets remain connected for this user
      const remaining = await redis.scard(`user:${userId}:sockets`);

      // 6. If no sockets remain, user is now offline — update status
      if (remaining === 0) {
        try {
          const user = await ChatUser.findOne({ userId });
          if (!user) return;
          await emitStatusToParticipants(userId, 'offline');
          user.status = 'offline';
          user.lastSeen = new Date(); // update last seen time
          await user.save();
        } catch (error) {
          console.error('Error updating user status to offline:', error);
        }
      }
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

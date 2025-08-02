import Redis from 'ioredis';
import { Chat } from '../models/chat.model.js';

const redis = new Redis();

/**
 * Emits real-time status updates to all users
 * who have chatted with the given userId.
 *
 * @param {string} userId - The user whose status changed
 * @param {'online'|'offline'} status - New status
 */
export async function emitStatusToParticipants(userId, status) {
  try {
    // 1. Find all chats where the user is a participant
    const chats = await Chat.find({ participants: userId });

    // 2. Collect all *other* participants from these chats
    const otherUserIds = new Set();
    for (const chat of chats) {
      for (const participantId of chat.participants) {
        if (participantId !== userId) {
          otherUserIds.add(participantId);
        }
      }
    }

    // 3. Import io only when needed (avoids circular dependency crash)
    const { getIo } = await import('../sockets/socket.js');
    const io = getIo();

    // 4. Emit the status to all connected sockets of those participants
    for (const participantId of otherUserIds) {
      const sockets = await redis.smembers(`user:${participantId}:sockets`);
      for (const socketId of sockets) {
        io.to(socketId).emit('user_status_changed', { userId, status });
      }
    }
  } catch (error) {
    console.error('Failed to emit status to participants:', error);
  }
}

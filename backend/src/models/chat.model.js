// Chat Collection: Handles BOTH Private & Group Chats

import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    isGroup: {
      type: Boolean,
      required: true,
    },
    createdBy: {
      type: String,
    },
    name: {
      type: String, // Only for group chats
      trim: true,
    },
    participants: {
      type: [String], // userIds from auth service
      required: true,
      validate: [(arr) => arr.length >= 2, 'At least 2 participants required'],
    },
    admins: {
      type: [String], // Optional: only for group chats
      default: [],
    },
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  { timestamps: true }
);

export const Chat = mongoose.model('Chat', chatSchema);

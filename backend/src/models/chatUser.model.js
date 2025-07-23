import mongoose from 'mongoose';

const chatUserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // 1 record per user
    },
    archivedChats: {
      type: [mongoose.Schema.Types.ObjectId],
      // ChatIds
      default: [],
    },
    nickname: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline',
    },
    lastSeen: {
      type: Date,
    },
    mutedChats: {
      type: [mongoose.Schema.Types.ObjectId], // Chat IDs
      default: [],
    },
  },
  { timestamps: true }
);

export const ChatUser = mongoose.model('ChatUser', chatUserSchema);

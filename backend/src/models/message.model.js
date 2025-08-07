import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    senderId: {
      type: String, // userId from auth service
      required: true,
    },
    type: {
      type: String,
      enum: ['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg', 'text'],
      default: 'text',
    },
    content: {
      type: String,
      required: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },

    seenBy: {
      type: [String], // userIds
      default: [],
    },
    deletedFor: {
      type: [String], // userIds who deleted the message
      default: [],
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);

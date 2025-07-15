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
      enum: ['text', 'image', 'file', 'audio', 'video'],
      default: 'text',
    },
    content: {
      type: String,
      required: true,
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

export default mongoose.model('Message', messageSchema);

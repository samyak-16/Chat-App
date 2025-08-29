import mongoose from 'mongoose';
import { getIo } from '../sockets/socket.js';
import { ApiError } from '../utils/api-error.js';
import { Chat } from '../models/chat.model.js';
import { Message } from '../models/message.model.js';
import { ApiResponse } from '../utils/api-response.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
// Send a message to a chat
// Logic by me /  Comments by chatGpt
const sendMessage = async (req, res) => {
  const io = getIo(); // Get socket.io instance
  const userId = req.user?.userId; // Authenticated user from middleware
  const files = req.files || []; // Files sent (images, videos, etc.)
  const chatId = req.body?.chatId; // Chat ID from request body
  const textMessage = req.body?.textMessage; // Optional text message

  console.log('Send message request:', {
    userId,
    chatId,
    textMessage,
    filesCount: files.length,
    files: files.map(f => ({ name: f.originalname, path: f.path, mimetype: f.mimetype }))
  });

  // Validate chatId
  if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          'chatId is required and must be a valid Mongoose ObjectID'
        )
      );
  }

  // Ensure at least one file or text message is provided
  if (files.length === 0 && !textMessage) {
    return res
      .status(400)
      .json(
        new ApiError(400, 'Content is required — either files or textMessage')
      );
  }

  try {
    // Check if chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json(new ApiError(404, 'Chat not found'));
    }

    // Ensure user is a participant
    if (!chat.participants.includes(userId)) {
      return res
        .status(403)
        .json(new ApiError(403, 'User not authorized in this chat'));
    }

    const createdMessage = [];

    // 1️⃣ Handle file uploads (images, audio, video, docs)
    for (const file of files) {
      try {
        console.log('Processing file:', file.originalname, 'Path:', file.path);
        
        // Check if file exists
        if (!file.path) {
          console.error('File path is missing for:', file.originalname);
          continue;
        }

        const result = await uploadOnCloudinary(file.path);
        if (!result) {
          console.warn(
            `Skipping file ${file.originalname} due to upload failure`
          );
          continue; // Skip failed uploads
        }

        const message = await Message.create({
          chatId,
          senderId: userId,
          type: file.mimetype, // Store the file type
          content: result.secure_url, // Cloudinary link
        });

        createdMessage.push(message);
        
        // Clean up the temporary file after successful upload
        try {
          const fs = await import('fs');
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (cleanupError) {
          console.warn('Failed to cleanup temporary file:', cleanupError);
        }
      } catch (fileError) {
        console.error('Error processing file:', file.originalname, fileError);
        continue; // Skip this file and continue with others
      }
    }

    // 2️⃣ Handle text message
    if (textMessage) {
      const message = await Message.create({
        chatId,
        senderId: userId,
        content: textMessage,
      });

      createdMessage.push(message);
    }

    // 3️⃣ Sort messages by creation time (oldest → newest)
    createdMessage.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    // 4️⃣ Update lastMessageId in chat & save
    if (createdMessage.length) {
      const lastMsg = createdMessage[createdMessage.length - 1];
      chat.lastMessageId = lastMsg._id;
      await chat.save();

      // Emit all message to all participants in the room
      io.to(chatId.toString()).emit('new_message', createdMessage);
    }

    // 5️⃣ Respond to API request
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { createdMessage },
          'Message sent and saved to DB successfully'
        )
      );
  } catch (error) {
    console.error('Error while sending message:', error);
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at sendMessage'));
  }
};

// Get messages in a chat (with pagination)
const getMessages = async (req, res) => {
  const userId = req.user?.userId;
  const chatId = req.params.chatId;
  if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
    return res
      .status(400)
      .json(new ApiError(400, 'chatId should be a valid moongoose objectId'));
  }
  const limit = parseInt(req.query.limit) || 20;
  const before = req.query.before; // timestamp string or ISO string of the last message

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json(new ApiError(404, 'chat not found '));
    }
    if (!chat.participants.includes(userId)) {
      return res
        .status(403)
        .json(new ApiError(403, 'Forbidden - User not part of  the chat'));
    }
    let query = { chatId, deletedFor: { $nin: [userId] } };
    if (before) {
      const beforeDate = new Date(before);
      if (isNaN(beforeDate.getTime())) {
        return res.status(400).json(new ApiError(400, 'Invalid before cursor'));
      }
      query.createdAt = { $lt: beforeDate }; // less than
    }

    //Fetch messages sorted by createdAt descending (latest first)
    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) // desc order (newest First)
      .limit(limit);

    //Reverse to send message from oldest to newest
    const orderedMessages = messages.reverse();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          orderedMessages,
          'Fetched Messages using cursor pagination'
        )
      );
  } catch (error) {
    console.error('Error while getting Messages : ', error);
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at getMessages'));
  }
};

const markMessageAsSeen = async (req, res) => {
  const userId = req.user?.userId;
  const messageId = req.params?.msgId;

  if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
    return res
      .status(400)
      .json(new ApiError(400, 'Valid messageId is required'));
  }
  if (!userId) {
    return res.status(400).json(new ApiError(400, 'User ID is required'));
  }

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json(new ApiError(404, 'Message not found'));
    }

    if (message.seenBy.includes(userId)) {
      return res
        .status(200)
        .json(new ApiResponse(200, message, 'Message already marked as seen'));
    }

    message.seenBy.push(userId);
    await message.save();

    // Emit socket event to notify other users

    const io = getIo();
    io.to(message.chatId.toString()).emit('message_seen', {
      messageId,
      seenByUserId: userId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, message, 'Message marked as seen successfully')
      );
  } catch (error) {
    console.error('Error marking message as seen:', error);
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at markMessageAsSeen'));
  }
};

// Soft delete a message for current user
const softDeleteMessage = async (req, res) => {
  const userId = req.user?.userId;
  const messageId = req.params?.msgId;

  if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
    return res
      .status(400)
      .json(new ApiError(400, 'Valid messageId is required in params'));
  }
  if (!userId) {
    return res
      .status(400)
      .json(new ApiError(400, 'UserId is required in the request'));
  }

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json(new ApiError(404, 'Message not found'));
    }

    // Check if user is participant of the chat (optional but recommended)
    const chat = await Chat.findById(message.chatId);
    if (!chat) {
      return res.status(404).json(new ApiError(404, 'Chat not found'));
    }
    if (!chat.participants.includes(userId)) {
      return res
        .status(403)
        .json(new ApiError(403, 'User not participant in the chat'));
    }

    // Add userId to deletedFor array if not already present
    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    return res
      .status(200)
      .json(new ApiResponse(200, message, 'Message soft deleted for user'));
  } catch (error) {
    console.error('Error while soft deleting message', error);
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at softDeleteMessage'));
  }
};

export { sendMessage, getMessages, markMessageAsSeen, softDeleteMessage };

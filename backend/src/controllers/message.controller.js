import mongoose from 'mongoose';
import { getIo } from '../sockets/socket.js';
import { ApiError } from '../utils/api-error.js';
import { Chat } from '../models/chat.model.js';
import { Message } from '../models/message.model.js';
import { ApiResponse } from '../utils/api-response.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
// Send a message to a chat
const sendMessage = async (req, res) => {
  const io = getIo();
  const userId = req.user?.userId;
  const files = req.files || [];
  const chatId = req.body?.chatId;
  const textMessage = req.body?.textMessage;
  if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          'chatId is requiured and must me valid moongoose ObjectID'
        )
      );
  }

  if (files.length == 0 && !textMessage) {
    return res
      .status(400)
      .json(
        new ApiError(400, 'Content is required  , either files or textMessage ')
      );
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json(new ApiError(404, 'chat not found '));
    }

    if (!chat.participants.includes(userId)) {
      return res
        .status(403)
        .json(new ApiError(403, 'User not authorized in this chat'));
    }

    const createdMessage = [];

    if (files.length >= 1) {
      for (const file of files) {
        const result = await uploadOnCloudinary(file.path);
        if (!result) {
          // Skip this file
          console.warn(
            `Skipping file ${file.originalname} due to upload failure`
          );
          continue;
        }

        const cloudinaryFileLink = result.secure_url;
        const message = await Message.create({
          chatId,
          senderId: userId,
          type: file.mimetype,
          content: cloudinaryFileLink,
        });
        await io.to(chatId.toString()).emit('new_message', {
          _id: message._id,
          chatId: message.chatId,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt,
        });
        createdMessage.push(message);
      }
    }
    if (textMessage) {
      const message = await Message.create({
        chatId,
        senderId: userId,
        content: textMessage,
      });
      await io.to(chatId.toString()).emit('new_message', {
        _id: message._id,
        chatId: message.chatId,
        senderId: message.senderId,
        type: message.type,
        content: message.content,
        createdAt: message.createdAt,
      });
      createdMessage.push(message);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { createdMessage },
          'Message sent and saved to db successfully'
        )
      );
  } catch (error) {
    console.error('Error while sending message', error);
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at sendMessage'));
  }
};

// Get messages in a chat (with pagination)
const getMessages = async (req, res) => {};

// Mark a message as seen
const markMessageAsSeen = async (req, res) => {};

// Soft delete a message for current user
const softDeleteMessage = async (req, res) => {};

export { sendMessage, getMessages, markMessageAsSeen, softDeleteMessage };

// Chat Controller Outline

import { Chat } from '../models/chat.model.js';
import { ChatUser } from '../models/chatUser.model.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';

// -------------------- SINGLE & GROUP CHAT BASE ACTIONS --------------------

// Start or get 1-on-1 chat
const startOrGetPrivateChat = async (req, res) => {
  const userId = req.user?.userId;
  const participantId = req.body?.participantId; //

  if (!participantId) {
    return res
      .status(400)
      .json(new ApiError(400, "participant's Id is required"));
  }
  if (!userId) {
    return res.status(400).json(new ApiError(400, 'User ID is required'));
  }
  if (userId === participantId) {
    return res
      .status(400)
      .json(new ApiError(400, 'Cannot create chat with yourself'));
  }

  try {
    const participantUser = await ChatUser.findOne({ userId: participantId });
    if (!participantUser) {
      return res
        .status(404)
        .json(new ApiError(404, 'participant User not found'));
    }

    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [userId, participantId], $size: 2 },
    });

    //$all -> $all checks if an array field contains all specified values — in any order.
    //$size -> $size checks if the array length matches a specific number.

    if (!chat) {
      console.log('Creating a new Chat');

      chat = await Chat.create({
        isGroup: false,
        participants: [userId, participantId],
      });
    }

    res
      .status(200)
      .json(new ApiResponse(200, chat, 'Private Chat fetched Succesfully'));
  } catch (error) {
    console.error('Error starting chat:', error);
    return res
      .status(500)
      .json(
        new ApiError(500, 'Internal Server Error at startOrGetPrivateChat')
      );
  }
};

// Create new group chat
const createGroupChat = async (req, res) => {};

// Get chat details
const getChatDetails = async (req, res) => {};

// Leave chat or delete it
const leaveOrDeleteChat = async (req, res) => {};

// Get all chats for current user (preview)
const getAllChatsForUser = async (req, res) => {};

// -------------------- GROUP CHAT MANAGEMENT ACTIONS --------------------

// Add users to group chat
const addUsersToGroup = async (req, res) => {};

// Remove users from group chat
const removeUsersFromGroup = async (req, res) => {};

// Promote user to admin
const promoteUserToAdmin = async (req, res) => {};

// Demote user from admin
const demoteUserFromAdmin = async (req, res) => {};

export {
  startOrGetPrivateChat,
  createGroupChat,
  getChatDetails,
  leaveOrDeleteChat,
  getAllChatsForUser,
  addUsersToGroup,
  removeUsersFromGroup,
  promoteUserToAdmin,
  demoteUserFromAdmin,
};

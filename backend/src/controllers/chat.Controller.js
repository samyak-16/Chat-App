// Chat Controller Outline

import { Chat } from '../models/chat.model.js';
import { ChatUser } from '../models/chatUser.model.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { filterValidUserIds } from '../utils/filterValidUserIds.js';

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
const createGroupChat = async (req, res) => {
  const userId = req.user?.userId;
  const participantsId = req.body?.participantsId; // participantsId is an array containing the userId of the members you wanna add .
  const name = req.body?.name;
  if (!name || name.trim() === '') {
    return res
      .status(400)
      .json(new ApiError(400, "Name is required and can't be empty string "));
  }
  if (!userId) {
    return res.status(400).json(new ApiError(400, 'User ID is required'));
  }
  if (!Array.isArray(participantsId) || participantsId.length < 1) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          'At least 1 user IDs are required in participantsId list (As you are already included)'
        )
      );
  }

  try {
    //Check all userId's provided  by the frontend are valid
    const result = await filterValidUserIds(participantsId);

    if (result.validUserIds.length == 0) {
      return res
        .status(400)
        .json(new ApiError(400, "No any userId's are valid"));
    }
    const allParticipants = [...new Set([...result.validUserIds, userId])]; // Using Set to remove all duplicates

    const chat = await Chat.create({
      isGroup: true,
      participants: allParticipants,
      admins: [userId],
      createdBy: userId,
      name,
    });

    res
      .status(201)
      .json(new ApiResponse(201, chat, 'Group Chat created Successfully'));
  } catch (error) {
    console.error('Error  creating groupChat : ', error);
    res
      .status(500)
      .json(new ApiError(500, 'internal Server Error at createGroupChat'));
  }
};

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

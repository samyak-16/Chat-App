// Chat Controller Outline

import mongoose from 'mongoose';
import { Chat } from '../models/chat.model.js';
import { ChatUser } from '../models/chatUser.model.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { filterValidUserIds } from '../utils/filterValidUserIds.js';
import { filterValidChatIds } from '../utils/filterValidChatIds.js';

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
const getChatDetails = async (req, res) => {
  const chatId = req.params?.chatId;
  const userId = req.user?.userId;

  if (!chatId) {
    return res.status(400).json(new ApiError(400, 'chatId is required'));
  }
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res
      .status(400)
      .json(new ApiError(400, 'chatId is not a valid mongoose ObjectId'));
  }

  if (!userId) {
    return res
      .status(400)
      .json(new ApiError(400, 'userId required in req object'));
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(400).json(new ApiError(400, 'chatId is not valid'));
    }

    if (!chat.participants.includes(userId)) {
      return res
        .status(403)
        .json(new ApiError(403, 'User is not part of the  requested chat'));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, chat, 'Chat fetched successfully'));
  } catch (error) {
    console.error('Error while gettingChatDetails : ', error);
    res
      .status(500)
      .json(new ApiError(500, 'internal Server Error at getChatDetails'));
  }
};

// Archive  single or multiple Chats (both private and group)
const archiveOrUnarchiveChats = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res
      .status(400)
      .json(new ApiError(400, 'userId required in req object'));
  }

  const chatIds = req.body?.chatIds; // Should be an Array
  if (!Array.isArray(chatIds) || chatIds.length === 0) {
    return res
      .status(400)
      .json(new ApiError(400, 'chatIds should be a non-empty array'));
  }

  // Validate chatIds
  let inValidChatIds = [];
  for (const chatId of chatIds) {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      inValidChatIds.push(chatId);
    }
  }

  if (inValidChatIds.length > 0) {
    return res
      .status(400)
      .json(
        new ApiError(400, 'Some chatIds are not valid objectId', inValidChatIds)
      );
  }

  try {
    const result = await filterValidChatIds(chatIds);
    if (result.validChatIds.length === 0) {
      return res.status(404).json(new ApiError(404, 'No valid chatIds found'));
    }

    const user = await ChatUser.findOne({ userId });
    if (!user) {
      return res.status(404).json(new ApiError(404, 'ChatUser not found'));
    }

    const allChatIds = [...new Set(result.validChatIds)];
    const archiveChats = [];
    const unArchiveChats = [];

    allChatIds.forEach((chatId) => {
      if (user.archivedChats.includes(chatId)) {
        unArchiveChats.push(chatId);
      } else {
        archiveChats.push(chatId);
      }
    });

    // Archive
    archiveChats.forEach((chatId) => {
      user.archivedChats.push(chatId);
    });

    // Unarchive
    unArchiveChats.forEach((chatId) => {
      user.archivedChats.pull(chatId);
    });

    await user.save();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          archivedChats: archiveChats,
          unArchivedChats: unArchiveChats,
          user,
        },
        'Archived/unarchived successfully'
      )
    );
  } catch (error) {
    console.error('Error while archiving/unArchiving chats:', error);
    res
      .status(500)
      .json(
        new ApiError(500, 'Internal Server Error at archiveOrUnarchiveChats')
      );
  }
};

// Get all chats for current user (preview)

const getAllChatsForUser = async (req, res) => {};

// -------------------- GROUP CHAT MANAGEMENT ACTIONS --------------------

// Leave group chat
const leaveGroupChat = async (req, res) => {
  const chatId = req.params?.chatId;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res
      .status(400)
      .json(new ApiError(400, 'chatId is not a valid mongoose ObjectId'));
  }

  const userId = req.user?.userId;
  if (!userId) {
    return res
      .status(400)
      .json(new ApiError(400, 'userId required in req object'));
  }

  try {
    const chat = await Chat.findOne({ _id: chatId, isGroup: true });
    if (!chat) {
      return res
        .status(400)
        .json(new ApiError(400, 'Group chat not found with given ID'));
    }

    if (!chat.participants.includes(userId)) {
      return res
        .status(403)
        .json(new ApiError(403, 'User is not part of this chat'));
    }

    // Remove user from participants and admins
    chat.participants.pull(userId);
    chat.admins.pull(userId); // If The user is not an admin → .pull() just does nothing.

    // If no one is left in group, delete chat
    if (chat.participants.length === 0) {
      await Chat.deleteOne({ _id: chatId });
      return res
        .status(200)
        .json(new ApiResponse(200, null, 'Group deleted as last user left'));
    }

    await chat.save();
    return res
      .status(200)
      .json(new ApiResponse(200, chat, 'Left group successfully'));
  } catch (error) {
    console.error('Error while leaving/Deleting chat:', error);
    res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at leaveGroupChat'));
  }
};

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
  leaveGroupChat,
  archiveOrUnarchiveChats,
  getAllChatsForUser,
  addUsersToGroup,
  removeUsersFromGroup,
  promoteUserToAdmin,
  demoteUserFromAdmin,
};

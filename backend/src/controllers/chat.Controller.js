// Chat Controller Outline

import mongoose, { Mongoose, Types } from 'mongoose';
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

const getAllChatsForUser = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res
      .status(400)
      .json(new ApiError(400, 'userId is requires in req object'));
  }
  try {
    const chats = await Chat.find({ participants: userId }).sort({
      updatedAt: -1,
    }); // -1 = descending (latest first)

    if (chats.length === 0) {
      return res
        .status(404)
        .json(
          new ApiError(
            404,
            'No chats Found For the user Please start a new Chat'
          )
        );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, chats, "Sorted lists of the user's chat "));
  } catch (error) {
    console.error('Error while fetching AllChats for the user :( ');
    res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at getAllChatsForUser'));
  }
};

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

const addUsersToGroup = async (req, res) => {
  const chatId = req.params?.chatId;
  const rawParticipantsId = req.body?.participantsId;
  const userId = req.user?.userId;

  // Validate chatId
  if (!chatId) {
    return res
      .status(400)
      .json(new ApiError(400, 'chatId is required in params'));
  }
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res
      .status(400)
      .json(new ApiError(400, 'chatId is not a valid Mongo ObjectId'));
  }

  // Validate participantsId
  if (!Array.isArray(rawParticipantsId) || rawParticipantsId.length < 1) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          'At least 1 user ID is required in participantsId list to add to the group'
        )
      );
  }

  // Remove duplicates
  const participantsId = [...new Set(rawParticipantsId)];

  // Prevent user from adding themself again
  if (participantsId.includes(userId)) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Don't add your own userId — you're already part of the group"
        )
      );
  }

  try {
    // Fetch the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json(new ApiError(404, 'Chat not found'));
    }

    // Ensure it is a group chat
    if (!chat.isGroup) {
      return res
        .status(400)
        .json(new ApiError(400, 'This chat is not a group chat'));
    }

    // Check if user making the request is a participant
    if (!chat.participants.includes(userId)) {
      return res
        .status(403)
        .json(new ApiError(403, 'You are not a member of this group chat'));
    }

    // Filter only valid userIds
    const { validUserIds, missingUserIds } = await filterValidUserIds(
      participantsId
    ); // Only add validUserIds and ignore missingUserIds
    if (validUserIds.length === 0) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            'None of the provided user IDs are valid',
            missingUserIds
          )
        );
    }

    // Add only users not already in participants
    let duplicateIds = [];
    validUserIds.forEach((id) => {
      if (!chat.participants.includes(id)) {
        chat.participants.push(id);
      } else {
        duplicateIds.push(id);
      }
    });

    await chat.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { chat, duplicateIds },
          'Users added to the group successfully excluding the duplicates'
        )
      );
  } catch (error) {
    console.error('Error while adding users to the group:', error);
    res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at addUsersToGroup'));
  }
};

// Remove users from group chat
const removeUsersFromGroup = async (req, res) => {
  // Extract chatId from URL params
  const chatId = req.params?.chatId;
  if (!chatId) {
    // chatId is required to identify which group to remove users from
    return res
      .status(400)
      .json(new ApiError(400, 'chatId is required in params'));
  }

  // Get the ID of the user making the request from the authenticated token
  const userId = req.user?.userId;

  // Extract the list of user IDs to remove from request body
  const rawParticipantsId = req.body?.participantsId;

  // Validate participantsId is a non-empty array
  if (!Array.isArray(rawParticipantsId) || rawParticipantsId.length === 0) {
    return res
      .status(400)
      .json(new ApiError(400, 'participantsId must be a non-empty array'));
  }

  // Validate chatId is a valid MongoDB ObjectId string
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res
      .status(400)
      .json(new ApiError(400, 'chatId must be a valid ObjectId'));
  }

  // Remove duplicate IDs from participants list (Set removes duplicates)
  const participantsId = [...new Set(rawParticipantsId)];

  // Prevent user from including themselves in participantsId
  if (participantsId.includes(userId)) {
    return res
      .status(400)
      .json(new ApiError(400, 'You cannot include yourself in participantsId'));
  }

  try {
    // Fetch the chat document by its ID
    const chat = await Chat.findById(chatId);

    // If chat not found, return 404
    if (!chat) {
      return res.status(404).json(new ApiError(404, 'Chat not found'));
    }

    // Ensure the chat is a group chat
    if (!chat.isGroup) {
      return res
        .status(400)
        .json(new ApiError(400, 'Provided chat is not a group chat'));
    }

    // Only admins can remove participants, check if current user is admin
    if (!chat.admins.includes(userId)) {
      return res
        .status(403)
        .json(new ApiError(403, 'Only admin can remove participants'));
    }

    // Validate provided participants IDs against actual users (returns valid IDs)
    const { validUserIds } = await filterValidUserIds(participantsId);

    // If no valid user IDs found, return error
    if (validUserIds.length === 0) {
      return res
        .status(400)
        .json(new ApiError(400, 'No valid participantsId found'));
    }

    // Remove each valid user ID from participants and admins array (if present)
    validUserIds.forEach((id) => {
      chat.participants.pull(id);
      chat.admins.pull(id);
    });

    // Save changes to the chat document
    await chat.save();

    // Return success response with updated chat object
    return res
      .status(200)
      .json(new ApiResponse(200, chat, 'Participants removed successfully'));
  } catch (error) {
    // Log error and return internal server error response
    console.error('Error while removing user from the group:', error);
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at removeUsersFromGroup'));
  }
};

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

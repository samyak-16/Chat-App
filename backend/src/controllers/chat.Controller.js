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
  const userId = req.user?.userId; // Authenticated user ID
  if (!userId) {
    return res
      .status(400)
      .json(new ApiError(400, 'userId is required in req object'));
  }
  try {
    // 1️⃣ Fetch all chats where the user is a participant
    const chats = await Chat.find({ participants: userId })
      .populate('lastMessageId') // Bring in last message details
      .sort({ updatedAt: -1 }); // Latest updated chats first
    if (chats.length === 0) {
      return res
        .status(404)
        .json(
          new ApiError(
            404,
            'No chats found for the user. Please start a new chat.'
          )
        );
    }
    // 2️⃣ Collect all unique participant IDs from all chats
    const participantIds = [
      ...new Set(chats.flatMap((chat) => chat.participants)),
    ];
    // 3️⃣ Fetch ChatUser docs for these participant IDs
    //    - Select only needed fields: nickname, avatar, status
    const chatUsers = await ChatUser.find({
      userId: { $in: participantIds },
    }).select('userId nickname avatar status');

    // 4️⃣ Build a lookup map for easy access
    const chatUserMap = {};
    chatUsers.forEach((user) => {
      chatUserMap[user.userId] = user;
    });

    // 5️⃣ Enrich each chat's participants with ChatUser info
    const enrichedChats = chats.map((chat) => {
      return {
        ...chat.toObject(),
        participants: chat.participants.map(
          (id) => chatUserMap[id] || { userId: id } // fallback if user not found
        ),
      };
    });

    // 6️⃣ Send enriched chats to frontend
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          enrichedChats,
          "Sorted list of user's chats with participant info"
        )
      );
  } catch (error) {
    console.error(
      'Error while fetching all chats for the user:',
      error.message
    );
    return res
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
// Remove users from group chat
const removeUsersFromGroup = async (req, res) => {
  // 1. Extract chatId from URL params
  const chatId = req.params?.chatId;

  // 2. Extract the ID of the user making the request (authenticated user)
  const userId = req.user?.userId;

  // 3. Extract the list of user IDs to remove from request body
  const rawParticipantsId = req.body?.participantsId;

  // 4. Validate required parameters
  if (!chatId)
    return res
      .status(400)
      .json(new ApiError(400, 'chatId is required in params'));

  if (!Array.isArray(rawParticipantsId) || rawParticipantsId.length === 0)
    return res
      .status(400)
      .json(new ApiError(400, 'participantsId must be a non-empty array'));

  if (!mongoose.Types.ObjectId.isValid(chatId))
    return res
      .status(400)
      .json(new ApiError(400, 'chatId must be a valid ObjectId'));

  // 5. Remove duplicate IDs from participants list
  const participantsId = [...new Set(rawParticipantsId)];

  // 6. Prevent user from including themselves
  if (participantsId.includes(userId))
    return res
      .status(400)
      .json(new ApiError(400, 'You cannot include yourself in participantsId'));

  try {
    // 7. Fetch the chat document by its ID
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json(new ApiError(404, 'Chat not found'));

    // 8. Ensure the chat is a group chat
    if (!chat.isGroup)
      return res
        .status(400)
        .json(new ApiError(400, 'Provided chat is not a group chat'));

    // 9. Only admins can remove participants
    if (!chat.admins.includes(userId))
      return res
        .status(403)
        .json(new ApiError(403, 'Only admin can remove participants'));

    // 10. Validate provided participants IDs against actual users
    const { validUserIds } = await filterValidUserIds(participantsId);
    if (validUserIds.length === 0)
      return res
        .status(400)
        .json(new ApiError(400, 'No valid participantsId found'));

    // 11. Filter out users that cannot be removed by the requester
    const filteredUserIds = validUserIds.filter((id) => {
      // Skip creator if requester is not creator
      if (id === chat.createdBy && userId !== chat.createdBy) return false;

      // Skip other admins if requester is not creator
      if (chat.admins.includes(id) && userId !== chat.createdBy) return false;

      return true;
    });

    // 12. If no valid users left after filtering, return error
    if (filteredUserIds.length === 0)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            'You cannot remove the group creator or other admins'
          )
        );

    // 13. Remove each valid user ID from participants and admins arrays
    filteredUserIds.forEach((id) => {
      chat.participants.pull(id); // Remove from participants
      chat.admins.pull(id); // Remove from admins if present
    });

    // 14. Save changes to the chat document
    await chat.save();

    // 15. Return success response with updated chat object
    return res
      .status(200)
      .json(new ApiResponse(200, chat, 'Participants removed successfully'));
  } catch (error) {
    // 16. Log unexpected errors
    console.error('Error while removing user from the group:', error);
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at removeUsersFromGroup'));
  }
};

// Promote user(s) to admin in a group chat
const promoteUserToAdmin = async (req, res) => {
  // Extract the ID of the current authenticated user from the request
  const userId = req.user?.userId;

  // Validate that userId exists in the request (user is authenticated)
  if (!userId) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "userId couldn't be found in the user inside req object"
        )
      );
  }

  // Extract the list of userIds to be promoted from request body
  const beingPromotedToAdmins = req.body?.beingPromotedToAdmins;

  // Check if beingPromotedToAdmins is a valid non-empty array
  if (
    !Array.isArray(beingPromotedToAdmins) ||
    beingPromotedToAdmins.length === 0
  ) {
    return res
      .status(400)
      .json(
        new ApiError(400, 'beingPromotedToAdmins should be a non-empty Array')
      );
  }

  // Prevent self-promotion for security reasons (user cannot promote themselves)
  if (beingPromotedToAdmins.includes(userId)) {
    return res
      .status(400)
      .json(new ApiError(400, 'You cannot include yourself in the list.'));
  }

  // Extract chatId from request parameters
  const chatId = req.params?.chatId;

  // Validate that chatId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res
      .status(400)
      .json(new ApiError(400, 'chatId in params is not a valid ObjectId'));
  }

  // Remove duplicates from beingPromotedToAdmins list
  const admins = [...new Set(beingPromotedToAdmins)];

  try {
    // Fetch the chat document by chatId from the database
    const chat = await Chat.findById(chatId);

    // If chat not found, return 404 error
    if (!chat) {
      return res.status(404).json(new ApiError(404, 'Chat not found'));
    }

    // Check if the chat is a group chat (only group chats have admins)
    if (!chat.isGroup) {
      return res
        .status(400)
        .json(new ApiError(400, 'Chat should be a groupChat'));
    }

    // Only the group creator can promote admins — check authorization
    if (chat.createdBy !== userId) {
      return res
        .status(403)
        .json(
          new ApiError(
            403,
            'Forbidden: Only the group creator can promote admins'
          )
        );
    }

    // Filter out invalid userIds from admins list (e.g. users that don't exist)
    const { validUserIds } = await filterValidUserIds(admins);

    // If no valid userIds remain after filtering, respond with error
    if (validUserIds.length == 0) {
      return res
        .status(400)
        .json(new ApiError(400, 'No any userIds were valid'));
    }

    // Identify users who are not participants in the chat (cannot be promoted)
    const notInParticipants = validUserIds.filter(
      (id) => !chat.participants.includes(id)
    );

    // Return error if some users are not part of the group
    if (notInParticipants.length > 0) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            'Some users are not part of the group and cannot be promoted',
            notInParticipants
          )
        );
    }

    // Promote users by adding them to the admins list if not already admins
    validUserIds.forEach((id) => {
      if (!chat.admins.includes(id)) {
        chat.admins.push(id);
      }
    });

    // Save the updated chat document with new admins to the database
    await chat.save();

    // Respond with success and updated admins list
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          chat.admins,
          'Selected users promoted to Admin successfully'
        )
      );
  } catch (error) {
    // Log unexpected errors and respond with generic server error message
    console.error('Error while promoting User to admin:', error);
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at promoteUserToAdmin'));
  }
};

// Demote users from admin role in a group chat
const demoteUserFromAdmin = async (req, res) => {
  const chatId = req.params?.chatId;
  const userId = req.user?.userId;
  const beingDemotedFromAdmins = req.body?.beingDemotedFromAdmins;

  // 1. Validate chatId
  if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
    return res
      .status(400)
      .json(new ApiError(400, 'Valid chatId is required in params'));
  }

  // 2. Validate userId in request
  if (!userId) {
    return res
      .status(400)
      .json(new ApiError(400, 'userId required in req object'));
  }

  // 3. Validate input array
  if (
    !Array.isArray(beingDemotedFromAdmins) ||
    beingDemotedFromAdmins.length === 0
  ) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          'beingDemotedFromAdmins should be a non-empty array of userIds'
        )
      );
  }

  // 4. Remove duplicates
  const removeFromAdminList = [...new Set(beingDemotedFromAdmins)];

  // 5. Prevent self-demotion
  if (removeFromAdminList.includes(userId)) {
    return res
      .status(405)
      .json(
        new ApiError(
          405,
          'Not allowed: You cannot demote yourself from admin role'
        )
      );
  }

  try {
    // 6. Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res
        .status(404)
        .json(new ApiError(404, 'Chat not found with provided chatId'));
    }

    // 6.5. only for groupChats : Only proceed if the chat is a group chat

    if (chat.isGroup === false) {
      return res
        .status(400)
        .json(
          new ApiError(400, 'Invalid operation: Chat should be a group chat')
        );
    }

    // 7. Only creator can demote admins
    if (chat.createdBy !== userId) {
      return res
        .status(403)
        .json(
          new ApiError(
            403,
            'Forbidden: Only the group creator can demote admins'
          )
        );
    }

    // 8. Validate user IDs
    const { validUserIds } = await filterValidUserIds(removeFromAdminList);
    if (validUserIds.length === 0) {
      return res
        .status(400)
        .json(new ApiError(400, 'No valid userIds in the list'));
    }

    // 9. Remove valid users from admins
    const demotableIds = validUserIds.filter((id) => chat.admins.includes(id));

    if (demotableIds.length === 0) {
      return res
        .status(400)
        .json(new ApiError(400, 'None of the provided users are admins'));
    }

    demotableIds.forEach((id) => {
      chat.admins.pull(id);
    });
    await chat.save();

    // 10. Response
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          chat.admins,
          'Users demoted from admin successfully (ignored userIds not in participants - No error will be thrown)'
        )
      );
  } catch (error) {
    console.error('Error while demoting user from admin:', error);
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error in demoteUserFromAdmin'));
  }
};

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

import { ChatUser } from '../models/chatUser.model.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import mongoose from 'mongoose';

const getMe = async (req, res) => {
  // Get ChatUser profile (nickname, muted chats, etc.)
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json(new ApiError(400, 'User ID is required'));
  }

  try {
    const user = await ChatUser.findOne({ userId });
    if (!user) {
      return res.status(404).json(new ApiError(404, 'User not found'));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, user, 'User profile retrieved successfully'));
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at getMe'));
  }
};

const setNickname = async (req, res) => {
  const { nickname } = req.body;
  const userId = req.user?.userId;
  if (!nickname || typeof nickname !== 'string' || nickname.trim() === '') {
    return res
      .status(400)
      .json(
        new ApiError(400, 'Nickname is required and must be a non-empty string')
      );
  }
  if (!userId) {
    return res.status(400).json(new ApiError(400, 'User ID is required'));
  }
  try {
    const user = await ChatUser.findOneAndUpdate(
      { userId },
      { nickname },
      { new: true }
    );

    if (!user) {
      return res.status(404).json(new ApiError(404, 'User not found'));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { nickname: user.nickname },
          "User's nickname changed successfully"
        )
      );
  } catch (error) {
    console.error('Error setting nickname:', error);
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at setNickname'));
  }
};

const muteChat = async (req, res) => {
  const { userId } = req.user;
  const { chatId } = req.params;

  if (!userId || !chatId) {
    return res.status(400).json(new ApiError(400, 'Both IDs are required'));
  }

  try {
    const user = await ChatUser.findOne({ userId });
    if (!user) {
      return res.status(404).json(new ApiError(404, 'User not found'));
    }
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json(new ApiError(400, 'Invalid chatId'));
    }
    const chatIdObj = mongoose.Types.ObjectId(chatId);
    const isMuted = user.mutedChats.some((id) => id.equals(chatIdObj));

    if (isMuted) {
      user.mutedChats.pull(chatIdObj);
    } else {
      user.mutedChats.push(chatIdObj);
    }

    await user.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { mutedChats: user.mutedChats },
          'Chat mute status toggled successfully'
        )
      );
  } catch (error) {
    console.error('Error muting/unmuting chat', error);
    return res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at muteChat'));
  }
};

export { getMe, setNickname, muteChat };

// ensureChatUserExists.js
import { ChatUser } from '../models/chatUser.model.js';
import { ApiError } from '../utils/api-error.js';

const ensureChatUserExists = async (req, res, next) => {
  const userId = req.user?.userId; // From verified JWT
  const name = req.user?.name;
  if (!userId) {
    return res.status(400).json(new ApiError(400, 'User ID is required'));
  }
  if (!name) {
    return res.status(400).json(new ApiError(400, 'Name is required'));
  }

  try {
    const existing = await ChatUser.findOne({ userId });

    if (!existing) {
      // First interaction → create default ChatUser
      await ChatUser.create({ userId, nickname: name });
      console.log('New User Created in  chatuser db ');
    }

    next(); // Proceed to next middleware or controller
  } catch (error) {
    console.error('Error in ensureChatUserExists:', error);
    res
      .status(500)
      .json(new ApiError(500, 'Internal Server Error at ensureChatUserExists'));
  }
};

export { ensureChatUserExists };

import { Chat } from '../models/chat.model.js';

const filterValidChatIds = async (chatIds) => {
  const chats = await Chat.find({ _id: { $in: chatIds } });

  const foundIds = chats.map((chat) => chat._id.toString());

  const validIds = chatIds.filter((chatId) => foundIds.includes(chatId));
  const missingIds = chatIds.filter((chatId) => !foundIds.includes(chatId));

  return {
    validChatIds: validIds,
    missingChatIds: missingIds,
  };
};
export { filterValidChatIds };

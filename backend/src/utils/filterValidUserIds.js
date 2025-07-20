import { ChatUser } from '../models/chatUser.model.js';
const filterValidUserIds = async (userIds) => {
  const users = await ChatUser.find({ userId: { $in: userIds } });
  const foundIds = users.map((u) => u.userId);

  const validIds = userIds.filter((id) => foundIds.includes(id));
  const missingIds = userIds.filter((id) => !foundIds.includes(id));

  return {
    validUserIds: validIds,
    missingUserIds: missingIds,
  };
};

export { filterValidUserIds };

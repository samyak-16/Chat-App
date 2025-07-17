// | Route                | Method | Description                              |
// | -------------------- | ------ | ---------------------------------------- |
// | `/api/chats/private` | POST   | Start or get 1-on-1 chat                 |
// | `/api/chats/group`   | POST   | Create new group chat                    |
// | `/api/chats/:chatId` | GET    | Get chat details                         |
// | `/api/chats/:chatId` | DELETE | Leave chat or delete it                  |
// | `/api/chats/`        | GET    | Get all chats for current user (preview) |

// ----------------GROUP CHAT ACTIONS----------------

// | Route                        | Method | Description                  |
// | ---------------------------- | ------ | ---------------------------- |
// | `/api/chats/:chatId/add`     | POST   | Add users to group chat      |
// | `/api/chats/:chatId/remove`  | POST   | Remove users from group chat |
// | `/api/chats/:chatId/promote` | POST   | Promote user to admin        |
// | `/api/chats/:chatId/demote`  | POST   | Demote user from admin       |

import express from 'express';
import {
  startOrGetPrivateChat,
  createGroupChat,
  getChatDetails,
  leaveOrDeleteChat,
  getAllChatsForUser,
  addUsersToGroup,
  removeUsersFromGroup,
  promoteUserToAdmin,
  demoteUserFromAdmin,
} from '../controllers/chat.Controller.js';

const router = express.Router();

// Base Chat Routes
router.post('/private', startOrGetPrivateChat);
router.post('/group', createGroupChat);
router.get('/:chatId', getChatDetails);
router.delete('/:chatId', leaveOrDeleteChat);
router.get('/', getAllChatsForUser);

// Group Chat Actions
router.post('/:chatId/add', addUsersToGroup);
router.post('/:chatId/remove', removeUsersFromGroup);
router.post('/:chatId/promote', promoteUserToAdmin);
router.post('/:chatId/demote', demoteUserFromAdmin);

export default router;

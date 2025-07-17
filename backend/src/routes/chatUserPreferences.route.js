// | Route                    | Method | Description           |
// | ------------------------ | ------ | --------------------- |
// | `/api/user/me`           | GET    | Get ChatUser profile  |
// | `/api/user/mute/:chatId` | POST   | Mute or unmute a chat |
// | `/api/user/nickname`     | POST   | Set/update nickname   |

import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.middleware.js';
import {
  getMe,
  muteChat,
  setNickname,
} from '../controllers/chatUser.controller.js';

const router = express.Router();

router.get('/me',  getMe);
router.post('/mute/:chatId',  muteChat);
router.post('/nickname',  setNickname);

// Export the router
export default router;

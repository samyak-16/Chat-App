// | Route                         | Method | Description                              |
// | ----------------------------- | ------ | ---------------------------------------- |
// | `/api/messages/send`          | POST   | Send a message to a chat                 |
// | `/api/messages/:chatId`       | GET    | Get messages in a chat (with pagination) |
// | `/api/messages/:msgId/seen`   | POST   | Mark message as seen                     |
// | `/api/messages/:msgId/delete` | POST   | Soft delete for current user             |

import express from 'express';
import {
  sendMessage,
  getMessages,
  markMessageAsSeen,
  softDeleteMessage,
} from '../controllers/message.controller.js';

const router = express.Router();

// Route to send a message
router.post('/send', sendMessage);

// Route to get messages of a chat (with pagination)
router.get('/:chatId', getMessages);

// Route to mark a message as seen
router.post('/:msgId/seen', markMessageAsSeen);

// Route to soft delete a message for current user
router.post('/:msgId/delete', softDeleteMessage);

export default router;

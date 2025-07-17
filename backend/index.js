import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { db } from './src/utils/db.js';
import { ApiResponse } from './src/utils/api-response.js';

//Importing Routes

import messagesRouter from './src/routes/messages.route.js';
import chatUserPreferencesRouter from './src/routes/chatUserPreferences.route.js';
import chatsRouter from './src/routes/chats.route.js';
import { verifyToken } from './src/middlewares/verifyToken.middleware.js';
import { ensureChatUserExists } from './src/middlewares/ensureChatUserExists.middleware.js';

//Connecting to Database
db();
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(
  cors({
    origin: process.env.clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Middlewares starts here :

app.use(verifyToken);
app.use(ensureChatUserExists);
//Routing Starts here
app.use('/api/chats', chatsRouter);

app.use('/api/messages', messagesRouter);
app.use('/api/user', chatUserPreferencesRouter);

//Routing Ends here

app.get('/', (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'Chat App API is Live'));
});

app.listen(port, () => {
  console.log(`Chat App  is live on  ${process.env.serverOrigin}:${port}`);
});

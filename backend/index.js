import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { db } from './src/utils/db.js';
import { ApiResponse } from './src/utils/api-response.js';

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
// app.use("/api/auth", authRoutes);   // /api/auth/register, login, etc.
// app.use("/api/user", userRoutes);
// app.use("/api/app", appRoutes);   // /api/app/register

// Home Routing

app.get('/', (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'Chat App API is Live'));
});

app.listen(port, () => {
  console.log(`Chat App  is live on  ${process.env.serverOrigin}:${port}`);
});

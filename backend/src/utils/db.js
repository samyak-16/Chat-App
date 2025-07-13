import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const db = () => {
  mongoose
    .connect(process.env.MOONGOSE_URL)
    .then(() => {
      console.log('Success connecting to MongoDB');
    })
    .catch((err) => {
      console.log('Connecting to MongoDB failed  : ', err);
    });
};

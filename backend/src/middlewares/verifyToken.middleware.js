// Verifiying JWT for each requests
// We will have a JWT Secret given by our auth-provider (Here im using my own auth-service-Built by me ! )
//We can wven use Public Key / Private Key setup to verify JWT - But its tomorrow thing : )
// So, we don't need to share the JWT-SECRET to anyone .

import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/api-error.js';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res
      .status(401)
      .json(new ApiError(401, 'Unauthorized: No token provided'));
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res
      .status(401)
      .json(new ApiError(401, 'Unauthorized: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // If it fails to verify, it will throw an error
    req.user = decoded;

    next();
  } catch (error) {
    console.log(error);
    return res
      .status(403)
      .json(new ApiError(403, 'Forbidden: Invalid token', [], error.stack));
  }
};

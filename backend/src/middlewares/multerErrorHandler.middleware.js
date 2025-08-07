import multer from 'multer';
import { ApiError } from '../utils/api-error.js';
const multerErrorHandler = async (err, req, res, next) => {
  console.log('Error: ', err.message);
  if (err instanceof multer.MulterError) {
    return res
      .status(400)
      .json(new ApiError(400, err.message || 'Multer Error'));
  }

  return res
    .status(err.status || 500)
    .json(
      new ApiError(err.status || 500, err.message || 'Something went wrong')
    );
};

export { multerErrorHandler };

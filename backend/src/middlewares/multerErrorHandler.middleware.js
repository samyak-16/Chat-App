import multer from 'multer';
import { ApiError } from '../utils/api-error.js';
const multerErrorHandler = async (err, req, res, next) => {
  console.log('Error: ', err.message);
  
  if (err instanceof multer.MulterError) {
    let userMessage = 'File upload error';
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        userMessage = 'File is too large. Maximum file size is 10MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        userMessage = 'Too many files. Maximum 5 files allowed per message.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        userMessage = 'Unexpected file field. Please use the correct file input.';
        break;
      default:
        userMessage = err.message || 'File upload error';
    }
    
    return res
      .status(400)
      .json(new ApiError(400, userMessage));
  }

  // Handle custom file type errors
  if (err.message && err.message.includes('Invalid file type')) {
    return res
      .status(400)
      .json(new ApiError(400, err.message));
  }

  return res
    .status(err.status || 500)
    .json(
      new ApiError(err.status || 500, err.message || 'Something went wrong')
    );
};

export { multerErrorHandler };

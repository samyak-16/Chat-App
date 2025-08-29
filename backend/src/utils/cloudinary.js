import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Check if file exists before uploading
    if (!fs.existsSync(localFilePath)) {
      console.error('File does not exist:', localFilePath);
      return null;
    }

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    console.log('File uploaded to Cloudinary:', response.url);
    return response;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    return null;
  }
};
export { uploadOnCloudinary };

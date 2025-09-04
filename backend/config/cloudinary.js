import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

// 1. Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Storage Engines for Cloudinary
const profilePictureStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'blood_hub_profiles',
        allowed_formats: ['jpeg', 'png', 'jpg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

const prescriptionStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'blood_hub_prescriptions',
        allowed_formats: ['jpeg', 'png', 'jpg'], // <-- PDF removed
        resource_type: 'image', // <-- Set to image for public URLs
    }
});

// 3. Multer Middleware for Memory Storage (for reports)
const memoryStorage = multer.memoryStorage();
export const uploadToMemory = multer({ storage: memoryStorage });


// 4. Multer Upload Middleware Exports
export const uploadProfilePicture = multer({ storage: profilePictureStorage });
export const uploadPrescription = multer({ storage: prescriptionStorage });

export default cloudinary;
import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"
import { ApiError } from './ApiError.js';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded successfully
        // console.log("file is uploaded on Cloudinary ", response.url);
        fs.unlinkSync(localFilePath) //delete file from local dir after uploading it on cloudinary. `Sync` term in syntax mean that we will move forward only after deleting the file.
        return response;
    } catch(error){
        fs.unlinkSync(localFilePath); //remove the locally saved temp file as the upload operation on cloud failed so clean the local storage as well.
    }
}

const deleteOnCloudinary = async(publicUrl) => {
    try {
        if(!publicUrl) return null;

        // Extract the public ID from the URL
        const publicId = cloudinary.url(imageUrl).public_id;

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: "auto"
        })

        return response;
    } catch(error){
        throw new ApiError(500, "Something went wrong while deleting old file from cloudinary")
    }
}

// No need of this; can diretlty get duration while uploading the file
// const getVideoDuration = async(publicUrl) => {
//     try {
//         if(!publicUrl) return null;

//         const publicId = cloudinary.url(imageUrl).public_id;
        
//         const response = await cloudinary.api.resource(publicId, {
//             resource_type: "video",
//             media_metadata: true,
//           })

//         return response;
//     } catch(error) {
//         throw new ApiError(500, "Something went wrong while fetching video duration")
//     }
// }

export {
    uploadOnCloudinary,
    deleteOnCloudinary,
    // getVideoDuration
};
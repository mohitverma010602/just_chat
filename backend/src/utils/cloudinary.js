import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.ClOUDINARY_CLOUD_NAME,
  api_key: process.env.ClOUDINARY_API_KEY,
  api_secret: process.env.ClOUDINARY_API_SECRET,
});

const getPublicIdFromUrl = (imageUrl) => {
  // Example Cloudinary URL: https://res.cloudinary.com/demo/image/upload/v1620918791/sample.jpg
  const parts = imageUrl.split("/");
  const filename1 = parts[parts.length - 2];
  const filename2 = parts[parts.length - 1];
  const publicId = `${filename1}/${filename2.split(".")[0]}`;
  return publicId;
};

const uploadOnCloudinary = async function (localFilePath) {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      use_filename: true,
      unique_filename: true,
      overwrite: true,
      folder: "blog-ger",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    throw new ApiError("Error while uploding file to cloudinary", 500);
  }
};

const deleteFromCloudinary = async function (imageUrl) {
  try {
    const publicId = getPublicIdFromUrl(imageUrl);
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok") {
      console.log("File deleted from cloudinary");
    } else {
      console.log("Error while deleting file from cloudinary inside");
    }
  } catch (error) {
    console.log(error);
    throw new ApiError("Error while deleting file from cloudinary", 500);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };

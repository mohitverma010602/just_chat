import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Extract token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", ""); // Ensure proper token format

    if (!token) {
      throw new ApiError("Unauthorized request", 401);
    }

    // Verify the token using the secret
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user by decoded token ID and exclude sensitive fields
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError("Invalid Access Token", 401);
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors and provide meaningful messages
    if (error.name === "JsonWebTokenError") {
      throw new ApiError("Invalid Access Token", 401);
    }
    if (error.name === "TokenExpiredError") {
      throw new ApiError("Access Token Expired", 401);
    }

    // Handle any other errors
    throw new ApiError(error.message || "Unauthorized request", 401);
  }
});

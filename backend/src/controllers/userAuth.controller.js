import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendEmailWithData } from "../utils/sendEmailWithData.js";

const generateTokens = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password, role } = req.body;

  if (!username || !email || !fullName || !password) {
    throw new ApiError("Please fill all the required details", 400);
  }

  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError("Avatar is required", 400);
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError("User already exists", 409);
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError("Error uploading avatar", 500);
  }

  const user = await User.create({
    username,
    email,
    fullName,
    password,
    role,
    avatar: avatar.url,
    online: true,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError("Error registering user", 500);
  }

  res
    .status(201)
    .json(new ApiResponse(createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email) || !password) {
    throw new ApiError("Username/Email and Password are required", 400);
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError("Invalid credentials", 401);
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  res
    .status(200)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json(
      new ApiResponse(
        { user, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  res
    .status(200)
    .clearCookie("accessToken", { httpOnly: true, secure: true })
    .clearCookie("refreshToken", { httpOnly: true, secure: true })
    .json(new ApiResponse({}, "User logged out successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError("Email is required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("User with this email does not exist", 404);
  }

  const resetToken = jwt.sign(
    { _id: user._id },
    process.env.RESET_PASSWORD_TOKEN,
    { expiresIn: "1h" }
  );

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/reset-password/${resetToken}`;

  await sendEmailWithData(
    email,
    "Password Reset Link",
    `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
  );

  res.status(200).json(new ApiResponse({}, "Password reset email sent"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    throw new ApiError("Token and new password are required", 400);
  }

  const decodedToken = jwt.verify(token, process.env.RESET_PASSWORD_TOKEN);
  const user = await User.findById(decodedToken._id);
  if (!user) {
    throw new ApiError("Invalid reset token or user does not exist", 400);
  }

  user.password = password;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse({}, "Password changed successfully"));
});

export { registerUser, loginUser, logoutUser, forgotPassword, resetPassword };

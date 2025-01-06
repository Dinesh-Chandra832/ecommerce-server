import { User } from "../models/index.js";
import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middleware/async.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// In-memory token blacklist (for demonstration purposes)
export let tokenBlacklist = [];

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;

  // Check if all required fields are provided
  if (!name || !email || !password || !passwordConfirm) {
    return next(new ErrorResponse("All fields are required", 400));
  }

  // Check if passwords match
  if (password !== passwordConfirm) {
    return next(new ErrorResponse("Passwords do not match", 400));
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new ErrorResponse("Email already in use", 400));
  }

  // Validate role (default to 'user' if not provided or invalid)
  if (role && !["user", "admin"].includes(role)) {
    return next(
      new ErrorResponse("Role must be either 'user' or 'admin'", 400)
    );
  }

  // Set the role to 'user' if not provided or invalid
  const userRole = role || "user";

  // Create the new user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: userRole, // Assign the role
  });

  // Send the token response (assuming you have sendTokenResponse to handle JWT)
  sendTokenResponse(user, 201, res, "User registered successfully");
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }

  /// Check if the user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("Invalid email or password", 401)); // Generalized message for security
  }

  // Validate password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return next(
      new ErrorResponse("The email or password you entered is incorrect", 401)
    ); // Same message as above
  }

  sendTokenResponse(user, 200, res, "Login successful");
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  sendTokenResponse(user, 200, res, "User profile retrieved successfully");
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() });

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: "Password reset email sent",
  });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Private
export const refreshToken = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  sendTokenResponse(user, 200, res);
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new ErrorResponse("Token is required to logout", 400));
  }

  tokenBlacklist.push(token); // Add token to the blacklist
  // res.status(200).json({
  //   success: true,
  //   message: "Successfully logged out",
  // });
  sendTokenResponse(user, 200, res, "Successfully logged out");
});

// Helper function to send token
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// Helper function to get token from model, create cookie and send response
// const sendTokenResponse = (user, statusCode, res) => {
//   const token = user.getSignedJwtToken();

//   res.status(statusCode).json({
//     success: true,
//     token,
//     data: {
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     },
//   });
// };

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
// export const register = asyncHandler(async (req, res, next) => {
//   const { name, email, password, passwordConfirm } = req.body;

//   // Validate password match
//   if (password !== passwordConfirm) {
//     return next(new ErrorResponse("Passwords do not match", 400));
//   }

//   // Validate password complexity
//   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
//   if (!passwordRegex.test(password)) {
//     return next(
//       new ErrorResponse(
//         "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number",
//         400
//       )
//     );
//   }

//   // Create user
//   const user = await User.create({
//     name: name.trim(),
//     email: email.toLowerCase().trim(),
//     password,
//   });

//   sendTokenResponse(user, 201, res);
// });

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
// export const login = asyncHandler(async (req, res, next) => {
//   const { email, password } = req.body;

//   // Find user by email (case insensitive)
//   const user = await User.findOne({ email: email.toLowerCase() }).select(
//     "+password"
//   );

//   if (!user) {
//     return next(new ErrorResponse("Invalid credentials", 401));
//   }

//   // Check password
//   const isMatch = await user.matchPassword(password);
//   if (!isMatch) {
//     return next(new ErrorResponse("Invalid credentials", 401));
//   }

//   sendTokenResponse(user, 200, res);
// });

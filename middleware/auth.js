import jwt from "jsonwebtoken";
import asyncHandler from "./async.js";
import ErrorResponse from "../utils/errorResponse.js";
import { User } from "../models/index.js";

import { tokenBlacklist } from "../controllers/authController.js"; // Import the blacklist

export const protect = asyncHandler(async (req, res, next) => {
  // Extract token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  // If token is missing, return a "Authentication token is missing" error
  if (!token) {
    return next(
      new ErrorResponse(
        "Authentication token is missing. Please provide a valid token to access this resource.",
        401
      )
    );
  }

  // Check if the token is blacklisted (user logged out)
  if (tokenBlacklist.includes(token)) {
    return next(
      new ErrorResponse(
        "This token is invalid as the user has logged out.",
        401
      )
    );
  }

  try {
    // Verify token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the decoded token
    req.user = await User.findById(decoded.id);
    // If user does not exist, return "User not found" error
    if (!req.user) {
      return next(
        new ErrorResponse("User associated with this token not found.", 401)
      );
    }

    next();
  } catch (err) {
    return next(
      new ErrorResponse(
        "Token verification failed. Please provide a valid token.",
        401
      )
    );
  }
});

/**
 * @desc Authorize user roles
 * @middleware
 * @route {GET, POST, PUT, DELETE} /api/v1/protected
 * @access Private (Admin only)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // If the user's role is not in the allowed roles list, return an error
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Access denied. Your role (${req.user.role}) is not authorized to access this resource.`,
          403
        )
      );
    }
    next();
  };
};

// export const protect = asyncHandler(async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     return next(new ErrorResponse("Not authorized to access this route", 401));
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id);

//     if (!req.user) {
//       return next(new ErrorResponse("User not found", 401));
//     }

//     if (!req.user.active) {
//       return next(new ErrorResponse("User account is deactivated", 401));
//     }

//     next();
//   } catch (err) {
//     return next(new ErrorResponse("Not authorized to access this route", 401));
//   }
// });

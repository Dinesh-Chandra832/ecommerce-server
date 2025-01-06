import { User } from "../models/index.js";
import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middleware/async.js";

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private

export const updateProfileById = asyncHandler(async (req, res, next) => {
  const userId = req.params.id; // Extract user ID from URL parameter

  // Prevent updates to sensitive fields
  const protectedFields = ["email", "password"];
  const updates = Object.keys(req.body);
  const hasProtectedUpdate = updates.some((update) =>
    protectedFields.includes(update)
  );

  // Allow role updates
  const allowedFields = ["name", "role"];
  const invalidFields = updates.filter(
    (update) => !allowedFields.includes(update)
  );

  if (invalidFields.length > 0) {
    return next(
      new ErrorResponse(`Invalid field(s): ${invalidFields.join(", ")}`, 400)
    );
  }

  if (hasProtectedUpdate) {
    return next(new ErrorResponse("Cannot update protected fields", 400));
  }

  // Find the user by ID and update
  const user = await User.findByIdAndUpdate(
    userId, // Use the ID from the URL parameter
    {
      $set: req.body,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User profile updated successfully",
    data: user,
  });
});

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin

export const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: users,
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin

export const getUserByID = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/v1/users
// @access  Private/Admin

export const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;

  // Validate role, default to 'user' if not provided
  if (role && role !== "user" && role !== "admin") {
    return next(
      new ErrorResponse("Role must be either 'user' or 'admin'", 400)
    );
  }

  const userRole = role || "user"; // Default to 'user' if no role is provided

  // Check if passwords match
  if (password !== passwordConfirm) {
    return next(new ErrorResponse("Passwords do not match", 400));
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse("Email already exists", 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: userRole, // Use default or provided role
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // Include role in response
    },
  });
});

// @desc    Update user password
// @route   PUT /api/v1/users/password
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  const isMatch = await user.matchPassword(req.body.currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse("Current password is incorrect", 401));
  }

  // Validate password match
  if (req.body.newPassword !== req.body.newPasswordConfirm) {
    return next(new ErrorResponse("Passwords do not match", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/v1/users/:id/status
// @access  Private/Admin
export const updateUserStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse("Cannot deactivate your own account", 400));
  }

  user.active = req.body.active;
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @swagger
// /api/v1/users/profile:
//   put:
//     summary: Update user profile
//     description: Update the user's profile information (name, email, address)
//     tags:
//       - Users
//     security:
//       - bearerAuth: []
//     requestBody:
//       required: true
//       content:
//         application/json:
//           schema:
//             type: object
//             properties:
//               name:
//                 type: string
//                 example: John Doe
//               email:
//                 type: string
//                 example: john.doe@example.com
//               address:
//                 type: string
//                 example: 123 Main St
//     responses:
//       200:
//         description: User profile updated successfully
//         content:
//           application/json:
//             schema:
//               $ref: '#/components/schemas/User'
//       400:
//         description: Invalid input
//       401:
//         description: Unauthorized
//       404:
//         description: User not found

// @swagger
// /api/v1/users:
//   get:
//     summary: Get all users
//     description: Get a list of all users (admin only)
//     tags:
//       - Users
//     security:
//       - bearerAuth: []
//     responses:
//       200:
//         description: A list of users
//         content:
//           application/json:
//             schema:
//               type: array
//               items:
//                 $ref: '#/components/schemas/User'
//       401:
//         description: Unauthorized
//       403:
//         description: Forbidden (admin only)

// @swagger
// /api/v1/users/{id}:
//   get:
//     summary: Get a single user
//     description: Get details of a user by ID (admin only)
//     tags:
//       - Users
//     security:
//       - bearerAuth: []
//     parameters:
//       - in: path
//         name: id
//         required: true
//         description: The ID of the user to retrieve
//         schema:
//           type: string
//     responses:
//       200:
//         description: A user object
//         content:
//           application/json:
//             schema:
//               $ref: '#/components/schemas/User'
//       404:
//         description: User not found
//       401:
//         description: Unauthorized
//       403:
//         description: Forbidden (admin only)

// @swagger
// /api/v1/users:
//   post:
//     summary: Create a new user
//     description: Admin creates a new user
//     tags:
//       - Users
//     security:
//       - bearerAuth: []
//     requestBody:
//       required: true
//       content:
//         application/json:
//           schema:
//             type: object
//             properties:
//               name:
//                 type: string
//                 example: Jane Doe
//               email:
//                 type: string
//                 example: jane.doe@example.com
//               password:
//                 type: string
//                 example: password123
//               role:
//                 type: string
//                 example: user
//     responses:
//       201:
//         description: User created successfully
//         content:
//           application/json:
//             schema:
//               $ref: '#/components/schemas/User'
//       400:
//         description: Invalid input
//       401:
//         description: Unauthorized
//       403:
//         description: Forbidden (admin only)

// export const createUser = asyncHandler(async (req, res, next) => {
//   const { name, email, password, passwordConfirm, role } = req.body;
//   // console.log("Request body:", req.body); // Log incoming request body
//   // console.log("Creating user with role:", role); // Log role value

//   // Validate role
//   if (role && !["user", "admin"].includes(role)) {
//     return next(
//       new ErrorResponse("Role must be either 'user' or 'admin'", 400)
//     );
//   }

//   // Check if passwords match
//   if (password !== passwordConfirm) {
//     return next(new ErrorResponse("Passwords do not match", 400));
//   }

//   // Check if email already exists
//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     return next(new ErrorResponse("Email already exists", 400));
//   }

//   // Create user
//   const user = await User.create({
//     name,
//     email,
//     password,
//     role: role, // Default to 'user' if no role is provided
//   });

//   res.status(201).json({
//     success: true,
//     data: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role, // Include role in response
//     },
//   });
// });

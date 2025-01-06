import express from "express";
import {
  getUsers,
  updateProfileById,
  getUserByID,
  createUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";
import { updateProfileValidator } from "../utils/validators.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management routes
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *       403:
 *         description: Forbidden
 */
router.get("/", getUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 example: user
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put("/:id", protect, updateProfileValidator, updateProfileById);

// /**
//  * @swagger
//  * /api/v1/users/password:
//  *   put:
//  *     tags: [Users]
//  *     summary: Update user password
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               currentPassword:
//  *                 type: string
//  *               newPassword:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Password updated successfully
//  *       400:
//  *         description: Bad request
//  */
// router.put("/password", updatePassword);

// /**
//  * @swagger
//  * /api/v1/users/{id}/status:
//  *   put:
//  *     tags: [Users]
//  *     summary: Update user status (Admin only)
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: User ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               active:
//  *                 type: boolean
//  *     responses:
//  *       200:
//  *         description: User status updated successfully
//  *       403:
//  *         description: Forbidden
//  */
// router.put("/:id/status", updateUserStatus);
// router.put("/:id/status", authorize("admin"), updateUserStatus);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a single user
 *     description: Get details of a user by ID (any authenticated user)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A user object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */
router.get("/:id", protect, getUserByID);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     description: Allows anyone to create a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *               role:
 *                 type: string
 *                 example: user
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */
router.post("/", createUser);

export default router;

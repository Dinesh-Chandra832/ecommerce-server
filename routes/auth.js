import express from "express";
import {
  register,
  login,
  getMe,
  logout,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { registerValidator } from "../utils/validators.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Registers a new user with an optional role. If no role is provided, the default role is 'user'. Admin role can be assigned by specifying "admin".
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               passwordConfirm:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 example: user
 *                 description: "The role of the user. If not provided, the role will default to 'user'. Specify 'admin' to assign an admin role."
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "your-jwt-token-here"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60f5c6f5f5f5f5f5f5f5f5f5"
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     role:
 *                       type: string
 *                       example: user
 *       400:
 *         description: Bad request (e.g., missing fields, invalid password)
 *       401:
 *         description: Unauthorized (if authentication fails)
 *       403:
 *         description: Forbidden (e.g., invalid role)
 */
router.post("/register", registerValidator, validateRequest, register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized (Invalid credentials)
 */
router.post("/login", login); // Removed 'protect' middleware from login route

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout a user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", protect, logout);

export default router;

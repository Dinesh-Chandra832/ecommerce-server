import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/auth.js";
import { productValidator } from "../utils/validators.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "5fdd0b63bcbf3b7b87a7a6a7"
 *         name:
 *           type: string
 *           example: "Laptop"
 *         description:
 *           type: string
 *           example: "High-end laptop for gaming"
 *         price:
 *           type: number
 *           format: float
 *           example: 1500.00
 *         category:
 *           type: string
 *           enum: [electronics, clothing, books, home, other]
 *           example: "electronics"
 *         stock:
 *           type: integer
 *           example: 100
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
router.route("/").get(getProducts);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []  # Apply bearer auth here
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized - User must be logged in
 *       403:
 *         description: Forbidden - Only admins can create products
 */
router
  .route("/")
  .post(protect, authorize("admin"), productValidator, createProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.route("/:id").get(getProductById);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Update an existing product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []  # Apply bearer auth here
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [electronics, clothing, books, home, other]
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request (e.g., invalid stock quantity)
 *       401:
 *         description: Unauthorized - User must be logged in
 *       403:
 *         description: Forbidden - Only admins can update products
 *       404:
 *         description: Product not found
 */
router
  .route("/:id")
  .put(protect, authorize("admin"), productValidator, updateProductById);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []  # Apply bearer auth here
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized - User must be logged in
 *       403:
 *         description: Forbidden - Only admins can delete products
 *       404:
 *         description: Product not found
 */
router.route("/:id").delete(protect, authorize("admin"), deleteProductById);

export default router;

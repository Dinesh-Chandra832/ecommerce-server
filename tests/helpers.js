import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User, Product, Order } from "../models/index.js";

dotenv.config();

// Initialize MongoMemoryServer
let mongoServer;

// Setup in-memory MongoDB before all tests
export const setupTestDB = async () => {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("In-memory MongoDB connected");
  }
};

// Cleanup in-memory MongoDB after all tests
export const cleanupTestDB = async () => {
  console.log(mongoServer);
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    console.log("In-memory MongoDB disconnected");
  }
};

// Cleanup after each test
export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
};

// Cleanup after running the tests
afterAll(async () => {
  // Disconnect from the in-memory MongoDB and stop the server
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    console.log("In-memory MongoDB disconnected");
  }
});

// Create and seed a test user
export const seedTestUser = async (userData = {}) => {
  const defaultData = {
    name: "Test User",
    email: "testuser@example.com",
    password: "Password123",
    role: "user",
  };

  const user = await User.create({ ...defaultData, ...userData });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return { token, userId: user._id };
};

// Create a user with the given email and role
export const createUser = async (email, role) => {
  const hashedPassword = await bcrypt.hash("Password@123!", 10); // Hash a default password
  const user = await User.create({
    name: email.split("@")[0], // Example: Extract name from email
    email,
    password: hashedPassword,
    role,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h", // Default to 1 hour if not set
  });
  return { token, userId: user._id };
};

/**
 * Creates a test product linked to a user.
 * @param {String} userId - The ID of the user creating the product.
 * @returns {Object} The created product document.
 */
// Updated function to include `createdBy`
export const createTestProduct = async (userId) => {
  const product = new Product({
    name: "Test Product",
    price: 100,
    description: "A product for testing",
    category: "electronics",
    createdBy: userId, // Assigning the createdBy field
    stock: 10,
  });

  await product.save();
  return product;
};

/**
 * Creates a test order for a user and product.
 * @param {String} userId - The ID of the user placing the order.
 * @param {String} productId - The ID of the product being ordered.
 * @returns {Object} The created order document.
 */
export const createTestOrder = async (userId, productId) => {
  return await Order.create({
    user: userId,
    items: [
      {
        product: productId,
        quantity: 1,
        price: 99.99,
      },
    ],
    totalAmount: 99.99,
    shippingAddress: {
      street: "123 Test St",
      city: "Test City",
      state: "Test State",
      zipCode: "12345",
      country: "Test Country",
    },
    paymentMethod: "creditCard",
  });
};

// working export const createUser = async (email, role = "user") => {
//   const user = await User.create({
//     name: "Test User",
//     email,
//     password: "Password123",
//     role,
//   });

// const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//   expiresIn: process.env.JWT_EXPIRES_IN || "1h", // Default to 1 hour if not set
// });

//   return { token, userId: user._id };
// };
// export const createUser = async (email, role = "user") => {
//   const user = await User.create({
//     name: "Test User",
//     email,
//     password: "Password123",
//     role,
//   });

//   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });

//   return { token, userId: user._id };
// };

// export const createTestProduct = async (userId) => {
//   return await Product.create({
//     name: "Test Product",
//     description: "This is a test product.",
//     price: 99.99,
//     category: "electronics",
//     stock: 10,
//     user: userId,
//   });
// };

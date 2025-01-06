import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server"; // ES module import

dotenv.config();

export const connectDB = async () => {
  try {
    const mongoUri =
      process.env.NODE_ENV === "test"
        ? (await MongoMemoryServer.create()).getUri()
        : process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in the .env file");
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    if (process.env.NODE_ENV !== "test") {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;

// module.exports = connectDB;

// /ecommerce-backend
// ├── /config                # Configuration files (e.g., DB, JWT secret)
// │   └── db.js
// │   └── config.js
// ├── /controllers           # Controller functions for handling API requests
// │   └── authController.js
// │   └── productController.js
// │   └── orderController.js
// │   └── userController.js
// ├── /models                # Mongoose models (schema definitions)
// │   └── userModel.js
// │   └── productModel.js
// │   └── orderModel.js
// │   └── orderItemModel.js
// ├── /routes                # API routes
// │   └── productRoutes.js
// │   └── orderRoutes.js
// │   └── userRoutes.js
// ├── /services              # Business logic (e.g., user authentication)
// │   └── authService.js
// │   └── orderService.js
// │   └── productService.js
// ├── /utils                 # Helper utilities (e.g., validation, error handling)
// │   └── errorHandler.js
// │   └── validate.js
// ├── /middleware            # Middleware (e.g., JWT authentication)
// │   └── authMiddleware.js
// ├── /tests/
// │    ├── setup.js
// │    ├── fixtures/
// │    │   └── testData.js
// │    └── integration/
// │        ├── auth.test.js
// │        ├── product.test.js
// │        ├── order.test.js
// │        └── user.test.js
// ├── app.js                 # Entry point for the backend application
// ├── server.js              # Server setup (listening on port)
// └── .env                   # Environment variables (DB URI, JWT secret)

import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { protect } from "./middleware/auth.js";
import securityMiddleware from "./middleware/security.js";
import errorHandler from "./middleware/error.js";

// Swagger API
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./swagger/swagger.js";

// Route files
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Swagger UI configuration
const swaggerUiOptions = {
  explorer: true,
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "E-Commerce API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
  },
};

// Mount Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, swaggerUiOptions)
);

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie parser
app.use(cookieParser());

// Security middleware
securityMiddleware(app);

// Compression
app.use(compression());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API Status
app.get("/api/v1/status", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running on port 5000 successfully",
  });
});

// Mount routers with the correct paths
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);

// Add protected route for testing
app.get("/api/v1/protected-route", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Access granted to protected route",
  });
});

// 404 handler
app.all("*", (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Error handler
app.use(errorHandler);

export default app;

// import express from "express";
// import morgan from "morgan";
// import cookieParser from "cookie-parser";
// import compression from "compression";
// import cors from "cors";
// import helmet from "helmet";
// import dotenv from "dotenv";
// import { protect } from "./middleware/auth.js";
// import securityMiddleware from "./middleware/security.js";
// import errorHandler from "./middleware/error.js";

// // Swagger API
// import swaggerUi from "swagger-ui-express";
// import swaggerDocs from "./swagger/swagger.js";

// // Route files
// import authRoutes from "./routes/auth.js";
// import userRoutes from "./routes/user.js";
// import productRoutes from "./routes/product.js";
// import orderRoutes from "./routes/order.js";

// // Load environment variables
// dotenv.config();

// const app = express();

// // Enable CORS
// app.use(cors());

// // Set security headers
// app.use(helmet());

// // Swagger UI configuration
// const swaggerUiOptions = {
//   explorer: true,
//   customCss: ".swagger-ui .topbar { display: none }",
//   customSiteTitle: "E-Commerce API Documentation",
//   swaggerOptions: {
//     persistAuthorization: true,
//   },
// };

// // Mount Swagger UI
// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerDocs, swaggerUiOptions)
// );

// // Body parser
// app.use(express.json({ limit: "10kb" }));
// app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// // Cookie parser
// app.use(cookieParser());

// // Security middleware
// securityMiddleware(app);

// // Compression
// app.use(compression());

// // Development logging
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

// // API Status
// app.get("/api/v1/status", (req, res) => {
//   res.status(200).json({
//     status: "success",
//     message: "API is running",
//   });
// });

// app.get("/api/v1/test", (req, res) => {
//   res.status(200).json({ success: true, message: "Test route is working!" });
// });

// // Mount routers
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/products", productRoutes);
// app.use("/api/v1/orders", orderRoutes);

// // Add protected route for testing (move this before the 404 handler)
// app.get("/api/v1/protected-route", protect, (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Access granted to protected route",
//   });
// });

// // 404 handler
// app.all("*", (req, res, next) => {
//   res.status(404).json({
//     success: false,
//     message: `Can't find ${req.originalUrl} on this server!`,
//   });
// });

// // Error handler
// app.use(errorHandler);

// export default app;

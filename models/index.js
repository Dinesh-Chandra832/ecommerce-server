import mongoose from "mongoose";

// Function to get or create model
const getModel = (name, schema) => {
  try {
    return mongoose.model(name);
  } catch (error) {
    return mongoose.model(name, schema);
  }
};

// Import schemas
import userSchema from "./schemas/userSchema.js";
import productSchema from "./schemas/productSchema.js";
import orderSchema from "./schemas/orderSchema.js";

// Register models
const User = getModel("User", userSchema);
const Product = getModel("Product", productSchema);
const Order = getModel("Order", orderSchema);

export { User, Product, Order };

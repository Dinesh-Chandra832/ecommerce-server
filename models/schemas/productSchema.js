import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [0, "Price must be greater than 0"],
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      enum: {
        values: [
          "electronics",
          "clothing",
          "books",
          "home",
          "other",
          "accessories",
          "storage",
          "furniture",
        ],
        message: "Invalid category",
      },
    },
    stock: {
      type: Number,
      required: [true, "Please add stock quantity"],
      min: [0, "Stock cannot be negative"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for search
productSchema.index({ name: "text", description: "text" });

export default productSchema;

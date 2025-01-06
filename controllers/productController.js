import { Product } from "../models/index.js";
import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middleware/async.js";

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res, next) => {
  const { products } = req.body;

  // Ensure 'products' is provided and is an array
  if (!products || (!Array.isArray(products) && typeof products !== "object")) {
    return next(
      new ErrorResponse(
        "Invalid input: 'products' must be an object or an array of product objects.",
        400
      )
    );
  }

  // Normalize to always handle an array
  const productArray = Array.isArray(products) ? products : [products];

  // Validate each product in the array
  const errors = [];
  const uniqueNames = new Set();

  for (let i = 0; i < productArray.length; i++) {
    const product = productArray[i];

    // Check for required fields
    if (!product.name || !product.price || !product.stock) {
      errors.push(
        `Product at index ${i} is missing required fields: 'name', 'price', or 'stock'.`
      );
      continue;
    }

    // Validate price and stock values
    if (product.price <= 0) {
      errors.push(`Product at index ${i} has an invalid price (must be > 0).`);
    }
    if (product.stock < 0) {
      errors.push(
        `Product at index ${i} has an invalid stock value (must be ≥ 0).`
      );
    }

    // Check for duplicate names in the request body
    if (uniqueNames.has(product.name)) {
      errors.push(
        `Product at index ${i} has a duplicate name within the request body.`
      );
    } else {
      uniqueNames.add(product.name);
    }
  }

  // If any validation errors were found, return them
  if (errors.length > 0) {
    return next(
      new ErrorResponse(`Validation errors: ${errors.join(" ")}`, 400)
    );
  }

  // Check for duplicate names in the database
  const existingProducts = await Product.find({
    name: { $in: productArray.map((p) => p.name) },
  });

  if (existingProducts.length > 0) {
    const duplicateNames = existingProducts.map((p) => p.name).join(", ");
    return next(
      new ErrorResponse(
        `Duplicate product names found in the database: ${duplicateNames}. Please use unique names.`,
        400
      )
    );
  }

  // Add 'createdBy' field and save products
  const productsWithCreator = productArray.map((product) => ({
    ...product,
    createdBy: req.user.id,
  }));

  const createdProducts = await Product.insertMany(productsWithCreator);

  res.status(201).json({
    success: true,
    message: `${createdProducts.length} product(s) created successfully!`,
    data: createdProducts,
  });
});

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
export const getProducts = asyncHandler(async (req, res, next) => {
  // Fetch all products without pagination or filters
  const products = await Product.find();

  // // Pagination
  // const page = parseInt(req.query.page, 10) || 1;
  // const limit = parseInt(req.query.limit, 10) || 10;
  // const startIndex = (page - 1) * limit;

  // // Build query
  // let query = Product.find();

  // // Price filter
  // if (req.query.minPrice) {
  //   query = query.where("price").gte(parseFloat(req.query.minPrice));
  // }
  // if (req.query.maxPrice) {
  //   query = query.where("price").lte(parseFloat(req.query.maxPrice));
  // }

  // // Category filter
  // if (req.query.category) {
  //   query = query.where("category").equals(req.query.category);
  // }

  // // Search
  // if (req.query.search) {
  //   const searchRegex = new RegExp(req.query.search, "i");
  //   query = query.or([{ name: searchRegex }, { description: searchRegex }]);
  // }

  // // Execute query with pagination
  // const products = await query.skip(startIndex).limit(limit);
  // const total = await Product.countDocuments(query.getQuery());

  res.status(200).json({
    success: true,
    message: "All products retrieved successfully",
    data: products,
    // pagination: {
    //   page,
    //   limit,
    //   total,
    //   pages: Math.ceil(total / limit),
    // },
  });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Product retrieved successfully",
    data: product,
  });
});

// @desc    Update product
// @route   PATCH /api/v1/products/:id
// @access  Private/Admin
export const updateProductById = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  // Validate stock updates
  if (req.body.stock !== undefined && req.body.stock < 0) {
    return next(new ErrorResponse("Stock cannot be negative", 400));
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  });
  // product = await Product.findByIdAndUpdate(req.params.id, req.body, {
  //   new: true,
  //   runValidators: true,
  // });

  // res.status(200).json({
  //   success: true,
  //   data: product,
  // });
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
export const deleteProductById = asyncHandler(async (req, res, next) => {
  // Find the product by ID
  const product = await Product.findById(req.params.id);

  // If product not found, return error response
  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  // Delete the product
  await Product.deleteOne({ _id: req.params.id });

  // Send success response
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// @desc    Add product rating
// @route   POST /api/v1/products/:id/ratings
// @access  Private
export const addProductRating = async (req, res, next) => {
  try {
    const { rating, review } = req.body;

    // Validate rating range
    if (!rating || rating < 1 || rating > 5) {
      return next(
        new ErrorResponse("Rating must be a number between 1 and 5", 400)
      );
    }

    // Validate review (optional but can add length validation if needed)
    if (review && review.trim().length < 5) {
      return next(
        new ErrorResponse("Review must be at least 5 characters long", 400)
      );
    }

    // Find the product by ID
    const product = await Product.findById(req.params.id);

    // Check if product exists
    if (!product) {
      return next(
        new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if user has already rated the product
    const alreadyRated = product.ratings.find(
      (r) => r.user.toString() === req.user.id
    );

    if (alreadyRated) {
      return next(
        new ErrorResponse("You have already rated this product", 400)
      );
    }

    // Add the rating and review
    product.ratings.push({
      user: req.user.id,
      rating,
      review,
    });

    // Recalculate the average rating
    const totalRatings = product.ratings.reduce(
      (sum, item) => sum + item.rating,
      0
    );
    product.averageRating = totalRatings / product.ratings.length;

    // Save the updated product
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product rating added successfully",
      data: {
        productId: product._id,
        ratings: product.ratings,
        averageRating: product.averageRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

// export const createProduct = asyncHandler(async (req, res, next) => {
//   const { products } = req.body;

//   // Check if request contains a single product or multiple products
//   if (!products || !Array.isArray(products) || products.length === 0) {
//     return next(
//       new ErrorResponse(
//         "Invalid input: 'products' must be a non-empty array of product objects",
//         400
//       )
//     );
//   }

//   // Validate each product in the array
//   const errors = [];
//   for (let i = 0; i < products.length; i++) {
//     const product = products[i];
//     if (!product.name || !product.price || !product.stock) {
//       errors.push(
//         `Product at index ${i} is missing required fields: 'name', 'price', or 'stock'`
//       );
//     } else if (product.price <= 0) {
//       errors.push(`Product at index ${i} has an invalid price`);
//     } else if (product.stock < 0) {
//       errors.push(`Product at index ${i} has an invalid stock value`);
//     }
//   }

//   // If any errors were found, return them
//   if (errors.length > 0) {
//     return next(
//       new ErrorResponse(`Validation errors: ${errors.join("; ")}`, 400)
//     );
//   }

//   // Add createdBy field to all products
//   const productsWithCreator = products.map((product) => ({
//     ...product,
//     createdBy: req.user.id,
//   }));

//   // Create products in the database
//   const createdProducts = await Product.insertMany(productsWithCreator);

//   res.status(201).json({
//     success: true,
//     message: `${createdProducts.length} product(s) created successfully!`,
//     data: createdProducts,
//   });
// });

// export const createProduct = asyncHandler(async (req, res, next) => {
//   req.body.createdBy = req.user.id;
//   const product = await Product.create(req.body);

//   res.status(201).json({
//     success: true,
//     message: "Product created successfully!",
//     data: product,
//   });
// });

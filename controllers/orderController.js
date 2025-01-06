import { Order, Product } from "../models/index.js";
import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middleware/async.js";

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(
      new ErrorResponse("Order must include at least one product item.", 400)
    );
  }

  if (!shippingAddress || typeof shippingAddress !== "object") {
    return next(
      new ErrorResponse("Shipping address is invalid or missing.", 400)
    );
  }

  if (!paymentMethod) {
    return next(new ErrorResponse("Payment method is required.", 400));
  }

  for (const item of items) {
    if (!item.product || !item.quantity) {
      return next(
        new ErrorResponse(
          "Each item must have a valid product ID and quantity.",
          400
        )
      );
    }
    const product = await Product.findById(item.product);
    if (!product) {
      return next(
        new ErrorResponse(
          `Product with ID ${item.product} does not exist.`,
          404
        )
      );
    }
    if (product.stock < item.quantity) {
      return next(
        new ErrorResponse(
          `Insufficient stock for product "${product.name}". Only ${product.stock} units are available.`,
          400
        )
      );
    }
  }

  let totalAmount = 0;
  const updatedItems = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.product);
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      product.stock -= item.quantity;
      await product.save();

      return {
        product: item.product,
        quantity: item.quantity,
        price: product.price,
      };
    })
  );

  const order = await Order.create({
    user: req.user.id,
    items: updatedItems,
    totalAmount,
    shippingAddress,
    paymentMethod,
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully! Thank you for shopping with us.",
    data: order,
  });
});

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private
export const getOrders = asyncHandler(async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate(
      "items.product",
      "name price"
    );

    if (orders.length === 0) {
      return next(new ErrorResponse("No orders found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully.",
      data: orders,
    });
  } catch (error) {
    return next(new ErrorResponse("Server Error: Unable to fetch orders", 500));
  }
});

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "items.product",
    "name price"
  );

  if (!order) {
    return next(new ErrorResponse("Order not found", 404));
  }

  // Make sure user owns order
  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You are not authorized to view this order.", 403)
    );
  }

  res.status(200).json({
    success: true,
    message: "Order details retrieved successfully.",
    data: order,
  });
});

// @desc    Cancel order
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse("Order not found", 404));
  }

  // Make sure user owns order
  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You are not authorized to cancel this order.", 403)
    );
  }

  // Check if order can be cancelled
  if (order.status !== "pending") {
    return next(new ErrorResponse("Only pending orders can be canceled.", 400));
  }

  // Restore stock
  await Promise.all(
    order.items.map(async (item) => {
      const product = await Product.findById(item.product);
      product.stock += item.quantity;
      await product.save();
    })
  );

  order.status = "cancelled";
  await order.save();

  res.status(200).json({
    success: true,
    message: "Order has been successfully canceled and stock restored.",
    data: order,
  });
});

// export const getOrders = asyncHandler(async (req, res, next) => {
//   const page = parseInt(req.query.page, 10) || 1;
//   const limit = parseInt(req.query.limit, 10) || 10;
//   const startIndex = (page - 1) * limit;

//   let query = { user: req.user.id };

//   // Add date range filter if provided
//   if (req.query.startDate && req.query.endDate) {
//     query.createdAt = {
//       $gte: new Date(req.query.startDate),
//       $lte: new Date(req.query.endDate),
//     };
//   }

//   const orders = await Order.find(query)
//     .skip(startIndex)
//     .limit(limit)
//     .populate("items.product", "name price");

//   const total = await Order.countDocuments(query);

//   res.status(200).json({
//     success: true,
//     data: {
//       orders,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     },
//   });
// });

// export const createOrder = asyncHandler(async (req, res, next) => {
//   const { items, shippingAddress, paymentMethod } = req.body;

//   // Validate that the items array is not empty
//   if (!items || items.length === 0) {
//     return next(
//       new ErrorResponse(
//         "No items provided in the order. Please add items to your cart before placing an order.",
//         400
//       )
//     );
//   }

//   // Create a map to avoid duplicate products
//   const uniqueItems = {};
//   for (const item of items) {
//     if (uniqueItems[item.product]) {
//       uniqueItems[item.product].quantity += item.quantity;
//     } else {
//       uniqueItems[item.product] = {
//         product: item.product,
//         quantity: item.quantity,
//       };
//     }
//   }

//   // Validate items exist and have sufficient stock
//   const productIds = Object.keys(uniqueItems);
//   const products = await Product.find({ _id: { $in: productIds } });

//   if (products.length !== productIds.length) {
//     return next(
//       new ErrorResponse(
//         "One or more products are not available. Please check your cart and try again.",
//         404
//       )
//     );
//   }

//   // Calculate total and update stock
//   let totalAmount = 0;
//   const updatedItems = [];

//   for (const product of products) {
//     const item = uniqueItems[product._id.toString()];
//     if (product.stock < item.quantity) {
//       return next(
//         new ErrorResponse(
//           `Insufficient stock for product ${product.name}. Available stock: ${product.stock}`,
//           400
//         )
//       );
//     }

//     const itemTotal = product.price * item.quantity;
//     totalAmount += itemTotal;

//     // Update stock
//     product.stock -= item.quantity;
//     await product.save();

//     updatedItems.push({
//       product: product._id,
//       quantity: item.quantity,
//       price: product.price,
//     });
//   }

//   // Create the order
//   const order = await Order.create({
//     user: req.user.id,
//     items: updatedItems,
//     totalAmount,
//     shippingAddress,
//     paymentMethod,
//   });

//   // Success message with more detail
//   res.status(201).json({
//     success: true,
//     message: "Your order has been successfully placed!",
//     data: order,
//   });
// });

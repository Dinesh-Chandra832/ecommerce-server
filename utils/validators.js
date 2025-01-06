import { body } from "express-validator";

export const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,}$/
    )
    .withMessage(
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email"),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

export const productValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a positive integer"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "electronics",
      "clothing",
      "books",
      "home",
      "other",
      "accessories",
      "storage",
      "furniture",
    ])
    .withMessage("Invalid category"),
];

export const orderValidator = [
  // Validate items array is not empty and each item has necessary fields
  body("items")
    .isArray({ min: 1 })
    .withMessage("Items should be an array containing at least one product")
    .custom((items) => {
      items.forEach((item, index) => {
        if (!item.product) {
          throw new Error(`Product ID is required for item at index ${index}`);
        }
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(
            `Quantity must be greater than 0 for item at index ${index}`
          );
        }
      });
      return true;
    }),

  // body("items.*.product").isMongoId().withMessage("Invalid product ID"),
  // body("items.*.quantity")
  //   .isInt({ min: 1 })
  //   .withMessage("Quantity must be at least 1"),

  // Validate shipping address fields
  body("shippingAddress")
    .notEmpty()
    .withMessage("Shipping address is required")
    .isObject()
    .withMessage("Shipping address should be an object")
    .custom((address) => {
      const requiredFields = ["street", "city", "state", "zipCode", "country"];
      requiredFields.forEach((field) => {
        if (!address[field]) {
          throw new Error(`Shipping address must contain ${field}`);
        }
      });
      return true;
    }),

  // body("shippingAddress.street")
  //   .trim()
  //   .notEmpty()
  //   .withMessage("Street address is required"),
  // body("shippingAddress.city")
  //   .trim()
  //   .notEmpty()
  //   .withMessage("City is required"),
  // body("shippingAddress.state")
  //   .trim()
  //   .notEmpty()
  //   .withMessage("State is required"),
  // body("shippingAddress.zipCode")
  //   .trim()
  //   .notEmpty()
  //   .withMessage("Zip code is required"),
  // body("shippingAddress.country")
  //   .trim()
  //   .notEmpty()
  //   .withMessage("Country is required"),

  // body("paymentMethod")
  //   .trim()
  //   .notEmpty()
  //   .withMessage("Payment method is required")
  //   .isIn(["creditCard", "debitCard", "paypal"])
  //   .withMessage("Invalid payment method"),

  // Validate payment method
  body("paymentMethod")
    .trim()
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["creditCard", "debitCard", "paypal"])
    .withMessage(
      "Payment method must be one of: creditCard, debitCard, or paypal"
    ),
];

export const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
];

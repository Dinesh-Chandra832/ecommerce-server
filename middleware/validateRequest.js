import { validationResult } from "express-validator";
import ErrorResponse from "../utils/errorResponse.js";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req); // Check validation results

  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400)); // Return error if validation fails
  }

  next(); // Proceed to the next middleware or route handler
};

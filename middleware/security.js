import rateLimit from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import cors from "cors";
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1000,
  message: "Too many requests from this IP, please try again after 10 minutes",
});

const securityMiddleware = (app) => {
  // Set security HTTP headers
  app.use(helmet());

  // Prevent XSS attacks
  app.use(xss());

  // Prevent http param pollution
  app.use(hpp());

  // Enable CORS
  app.use(cors());

  // Rate limiting
  app.use("/api", limiter);
};

export default securityMiddleware;
// module.exports = securityMiddleware;

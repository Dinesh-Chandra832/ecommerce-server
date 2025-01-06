require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || "secret-key",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "30d",
  NODE_ENV: process.env.NODE_ENV || "development",
  MAX_FILE_SIZE: 1024 * 1024 * 5, // 5MB
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
};

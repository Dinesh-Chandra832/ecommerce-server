import app from "./app.js";
// const connectDB from "./config/db.js";
import connectDB from "./config/db.js"; // Ensure the `.js` extension is present

const { PORT, NODE_ENV } = process.env;

// Ensure that required environment variables are available
if (!PORT) {
  console.error("Error: PORT is not defined in the .env file");
  process.exit(1);
}

// Connect to the database
connectDB();

// Default to 5000 if PORT is not specified
const serverPort = PORT || 5000;

// Start the server
const server = app.listen(serverPort, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${serverPort}`);
  console.log(`Server URL: http://localhost:${serverPort}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  console.error("Unhandled rejection, shutting down gracefully...");
  // Close the server and exit the process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions (optional but useful for debugging)
process.on("uncaughtException", (err) => {
  console.error(`Uncaught exception: ${err.message}`);
  console.error("Shutting down due to uncaught exception...");
  // Close the server and exit the process
  server.close(() => {
    process.exit(1);
  });
});

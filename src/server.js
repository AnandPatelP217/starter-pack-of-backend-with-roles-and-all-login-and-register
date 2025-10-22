/**
 * Main server entry point - This is where everything starts!
 * I've separated the Express app configuration from the server setup
 * to keep things clean and testable.
 */

import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";

// Load environment variables first - I need these for DB connection and port
dotenv.config();

// Use environment port or fallback to 4000 for local development
const PORT = process.env.PORT || 5000;

// Connect to MongoDB - this is where all my precious data lives
// I do this before starting the server to ensure DB is ready
connectDB(process.env.MONGO_URI);

// Start the server and listen on the specified port
// The server will be accessible from any IP address (0.0.0.0)
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Set request timeout to 15 seconds - prevents hanging requests
server.timeout = 15000;

/**
 * Graceful shutdown handler - I want my server to close cleanly
 * This ensures that:
 * 1. No new connections are accepted
 * 2. Existing connections finish processing
 * 3. Database connections are properly closed
 * 4. No data is lost during shutdown
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n ${signal} received. Closing server gracefully...`);

  // Stop accepting new connections but let existing ones finish
  server.close(async (err) => {
    if (err) {
      console.error("Error closing the server", err);
      process.exit(1);
    }

    // Close DB connection to prevent memory leaks
    await disconnectDB();
    console.log("MongoDB connection closed.");
    console.log("Server shut down gracefully.");
    process.exit(0);
  });
};

// Listen for termination signals from the operating system
// SIGINT: Ctrl+C in terminal
// SIGTERM: Docker/PM2 shutdown signal
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Catch unhandled promise rejections - better safe than sorry!
// This prevents the app from crashing silently
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  gracefulShutdown("unhandledRejection");
});

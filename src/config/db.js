/**
 * Database configuration and connection management
 * I use MongoDB with Mongoose for my data layer
 * This module handles connecting and disconnecting from the database
 */

import mongoose from "mongoose";

/**
 * Establishes connection to MongoDB database
 * @param {string} MONGO_URI - MongoDB connection string from environment variables
 *
 * I use async/await pattern here because database connections are inherently asynchronous
 * If the connection fails, I exit the process since the app can't function without DB
 */
export const connectDB = async (MONGO_URI) => {
  try {
    // Mongoose handles connection pooling and reconnection automatically
    const conn = await mongoose.connect(MONGO_URI);

    console.log(`Database connected: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);

    // Set up connection event listeners for monitoring
    mongoose.connection.on("disconnected", () => {
      console.log("Database disconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Database error:", err);
    });
  } catch (error) {
    console.error(`DB connection failed: ${error.message}`);
    process.exit(1); // If DB fails, there's no point continuing - fail fast!
  }
};

/**
 * Gracefully closes the database connection
 * I use this during server shutdown to prevent memory leaks
 * and ensure all pending operations complete
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("Database connection closed cleanly");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
};

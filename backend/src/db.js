import mongoose from "mongoose";

/**
 * Connect to MongoDB using the provided URI.
 *
 * @param {string} uri MongoDB connection string
 * @returns {Promise<mongoose.Connection>} MongoDB connection
 */
export async function connectDB(uri) {
  if (!uri) {
    throw new Error("MONGODB_URI missing");
  }
  // Use strict query mode for Mongoose 7+
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  return mongoose.connection;
}

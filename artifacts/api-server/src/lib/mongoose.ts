import mongoose from "mongoose";
import { logger } from "./logger";

let isConnected = false;

export async function connectMongoDB(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    logger.info("Connected to MongoDB");
  } catch (err) {
    logger.error({ err }, "Failed to connect to MongoDB");
    throw err;
  }

  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB connection error");
    isConnected = false;
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
    isConnected = false;
  });
}

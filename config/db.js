const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.warn("⚠️  MongoDB connection failed — running without DB:", error.message);
    // Server keeps running; counter endpoints will degrade gracefully
  }
}

module.exports = connectDB;

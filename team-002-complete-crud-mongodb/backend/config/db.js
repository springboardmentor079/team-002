const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Add it to backend/.env.");
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const safeMessage = message
      .replace(/(mongodb(?:\+srv)?:\/\/)[^@\s]+@/i, "$1<redacted>@")
      .replace(/(password=)[^&\s]+/gi, "$1<redacted>");

    throw new Error(`MongoDB connection failed: ${safeMessage}`);
  }
};

module.exports = connectDB;
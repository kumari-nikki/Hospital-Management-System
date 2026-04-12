import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(
    process.env.MONGODB_URL
    );
    console.log("Db is connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};
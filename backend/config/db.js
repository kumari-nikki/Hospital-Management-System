import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://nikkibellla66_db_user:xgdxVEf6YaVB67lz@cluster0.6p3wqyj.mongodb.net/HospitalManagementSystem?retryWrites=true&w=majority"
    );
    console.log("Db is connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};
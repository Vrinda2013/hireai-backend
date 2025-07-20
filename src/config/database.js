import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hireai';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
  }
}; 
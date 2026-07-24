import mongoose from 'mongoose';

export const connectDB = async (uri?: string): Promise<void> => {
  try {
    const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/task_manager';
    await mongoose.connect(mongoUri);
    if (process.env.NODE_ENV !== 'test') {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};

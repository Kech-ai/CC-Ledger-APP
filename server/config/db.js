import mongoose from 'mongoose';

const connectDB = async () => {
  // Check if the MONGO_URI is set and is not left at a dummy placeholder value.
  // The real value must be provided via environment variables (e.g. server/.env in dev,
  // or the hosting provider's environment settings in production).
  const isUnset = !process.env.MONGO_URI;
  const isPlaceholder = process.env.MONGO_URI === 'your_mongo_connection_string_here';

  if (isUnset || isPlaceholder) {
    console.warn('-------------------------------------------------------------------');
    console.warn('WARNING: MONGO_URI is not configured.');
    console.warn('The application will start, but API endpoints requiring a database will not work.');
    console.warn('Please configure the MongoDB connection string via environment variables.');
    console.warn('-------------------------------------------------------------------');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // We don't exit the process here, to allow the server to start and serve the client app.
    // The API endpoints will likely fail, but the frontend will be accessible.
    console.warn('Server will continue running, but database operations will fail.');
  }
};

export default connectDB;
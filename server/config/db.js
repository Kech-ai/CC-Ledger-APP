import mongoose from 'mongoose';

const connectDB = async () => {
  // Check if the MONGO_URI is set and is not the placeholder value
  if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongodb_connection_string_here') {
    console.warn('-------------------------------------------------------------------');
    console.warn('WARNING: MONGO_URI is not set in server/.env file.');
    console.warn('The application will start, but API endpoints requiring a database will not work.');
    console.warn('Please add your MongoDB connection string to server/.env');
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
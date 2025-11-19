import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Load environment variables.
// - In local dev, this loads server/.env regardless of the working directory.
// - In production (e.g. Render), config should come from real environment variables;
//   if server/.env does not exist, dotenv.config will simply do nothing.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. Auth will fail until JWT_SECRET is configured.');
} else {
  console.log('JWT_SECRET is configured.');
}

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/uploads', uploadRoutes);

// --- SERVE STATIC ASSETS ---
// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Serve frontend (built Vite app from dist/)
const clientPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(clientPath));

// For any route that is not an API route, serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientPath, 'index.html'));
});


// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
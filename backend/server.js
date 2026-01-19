import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import serviceRoutes from './routes/service.js';
import orderRoutes from './routes/order.js';
import subscriptionRoutes from './routes/subscription.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Local Services API is running' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

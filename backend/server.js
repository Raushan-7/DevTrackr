// Load and validate environment variables first
const { PORT } = require('./src/config/env');

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Import route modules
const authRoutes = require('./src/routes/auth');
const githubRoutes = require('./src/routes/github');
const aiRoutes = require('./src/routes/ai');
const dashboardRoutes = require('./src/routes/dashboard');
const reportsRoutes = require('./src/routes/reports');

// Initialize database connection
connectDB();

const app = express();

// Standard Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default API health status route
app.get('/api/health', (req, res) => {
  return res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    service: 'DevTrackr Backend API'
  });
});

// Register routers
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

// Catch-all route for unmatched API requests
app.use('/api', (req, res) => {
  return res.status(404).json({ message: 'API endpoint not found.' });
});

// Global central error handler middleware
app.use(errorHandler);

// Start server listening
app.listen(PORT, () => {
  console.log(`🚀 DevTrackr Server running in development mode on port ${PORT}`);
  console.log(`🔗 API endpoint base: ${process.env.API_URL || `http://localhost:${PORT}`}/api`);
});

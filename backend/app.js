const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock Authentication Middleware
// Attaches a mock user to every request
app.use((req, res, next) => {
  req.user = {
    id: 'admin_user',
    name: 'Admin'
  };
  next();
});

// Basic route for health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Contract Management Platform API',
    status: 'running'
  });
});

// API Routes
app.use('/api/blueprints', require('./routes/blueprints'));
app.use('/api/contracts', require('./routes/contracts'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock Authentication Middleware
// Attaches a mock user to every request
// Accepts x-user-role header to simulate different user roles
app.use((req, res, next) => {
  const userRole = req.headers['x-user-role'] || 'admin';
  
  // Map role to user details
  const roleMap = {
    admin: { id: 'admin_user', name: 'Admin', role: 'admin' },
    approver: { id: 'approver_user', name: 'Approver', role: 'approver' },
    signer: { id: 'signer_user', name: 'Signer', role: 'signer' }
  };

  req.user = roleMap[userRole] || roleMap.admin;
  next();
});

// Basic route for health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Contract Management Platform API',
    status: 'running'
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Contract Management Platform API Documentation'
}));

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

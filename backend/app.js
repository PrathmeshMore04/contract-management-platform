const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const userRole = req.headers['x-user-role'] || 'admin';
  
  const roleMap = {
    admin: { id: 'admin_user', name: 'Admin', role: 'admin' },
    approver: { id: 'approver_user', name: 'Approver', role: 'approver' },
    signer: { id: 'signer_user', name: 'Signer', role: 'signer' }
  };

  req.user = roleMap[userRole] || roleMap.admin;
  next();
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Contract Management Platform API',
    status: 'running'
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Contract Management Platform API Documentation'
}));

app.use('/api/blueprints', require('./routes/blueprints'));
app.use('/api/contracts', require('./routes/contracts'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;

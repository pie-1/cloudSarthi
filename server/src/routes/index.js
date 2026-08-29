const express = require('express');
const router = express.Router();

// Import route modules
const incidentRoutes = require('./incidents');
const serviceRoutes = require('./services');
const userRoutes = require('./users');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'CloudSarthi API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount routes
router.use('/incidents', incidentRoutes);
router.use('/services', serviceRoutes);
router.use('/users', userRoutes);

module.exports = router;
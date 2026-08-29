const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const incidentRoutes = require('./routes/incidents');
const serviceRoutes = require('./routes/services');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudsarthi')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err.message));

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'CloudSarthi API',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/incidents', incidentRoutes);
// app.use('/api/services', serviceRoutes);
// app.use('/api/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
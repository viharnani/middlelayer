const express = require('express');
const cron = require('node-cron');
const { connectMongoDB } = require('./config/db');
const dataRoutes = require('./routes/dataRoutes');
const setupSwagger = require('./utils/swagger');
const { cacheHourlyData } = require('./services/cacheService');
const config = require('./config/config');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', dataRoutes);

// Setup Swagger documentation
setupSwagger(app);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Sensor Data Middle Layer API',
    documentation: '/api-docs'
  });
});

// Connect to MongoDB
connectMongoDB().then(() => {
  // Schedule hourly data caching job
  // This runs at the beginning of every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled task to cache hourly data');
    await cacheHourlyData();
  });
  
  // Run initial cache population
  cacheHourlyData();
  
  // Start the server
  const PORT = config.server.port;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger documentation: http://localhost:${PORT}/api-docs`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
}); 
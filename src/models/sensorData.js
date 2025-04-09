const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  // Data fields
  userId: { type: String, index: true },
  buildingId: { type: String, index: true },
  locationId: { type: String, index: true },
  sensorType: { type: String, index: true },
  sensorId: { type: String, index: true },
  
  // Timestamp for the data
  timestamp: { type: Date, index: true },
  
  // Hour marker to quickly filter by hour
  hourKey: { type: String, index: true },
  
  // The actual sensor values
  value: mongoose.Schema.Types.Mixed,
  
  // TTL field
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});

// Create a compound index for efficient filtering by multiple parameters
sensorDataSchema.index({ 
  userId: 1, 
  buildingId: 1, 
  locationId: 1, 
  sensorType: 1, 
  sensorId: 1, 
  hourKey: 1 
});

module.exports = mongoose.model('SensorData', sensorDataSchema); 
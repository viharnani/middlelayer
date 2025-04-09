const { mysqlPool } = require('../config/db');
const SensorData = require('../models/sensorData');
const config = require('../config/config');

/**
 * Generates an hourKey string from a date object
 * @param {Date} date - The date to generate key from
 * @returns {string} - Hour key in format YYYY-MM-DD-HH
 */
const generateHourKey = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}`;
};

/**
 * Fetches the previous hour's data from MySQL and stores it in MongoDB
 */
const cacheHourlyData = async () => {
  try {
    const now = new Date();
    // Calculate previous hour's time range
    const endDate = new Date(now);
    endDate.setMinutes(0, 0, 0); // Start of current hour
    
    const startDate = new Date(endDate);
    startDate.setHours(endDate.getHours() - 1); // One hour before
    
    console.log(`Fetching data from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Format for MySQL query
    const startTimestamp = startDate.toISOString().slice(0, 19).replace('T', ' ');
    const endTimestamp = endDate.toISOString().slice(0, 19).replace('T', ' ');
    
    // Create hour key for this batch
    const hourKey = generateHourKey(startDate);
    
    // Query MySQL for data in the last hour
    const query = `
      SELECT * FROM sensor_data 
      WHERE timestamp >= ? AND timestamp < ?
    `;
    
    const [rows] = await mysqlPool.execute(query, [startTimestamp, endTimestamp]);
    
    if (rows.length === 0) {
      console.log('No new data to cache for the previous hour');
      return;
    }
    
    console.log(`Found ${rows.length} records to cache`);
    
    // Transform and prepare data for MongoDB
    const cacheData = rows.map(row => ({
      userId: row.user_id,
      buildingId: row.building_id,
      locationId: row.location_id,
      sensorType: row.sensor_type,
      sensorId: row.sensor_id,
      timestamp: row.timestamp,
      hourKey,
      value: row.value,
      createdAt: new Date()
    }));
    
    // Insert data into MongoDB
    await SensorData.insertMany(cacheData);
    
    console.log(`Successfully cached ${cacheData.length} records for hour: ${hourKey}`);
  } catch (error) {
    console.error('Error caching hourly data:', error);
  }
};

/**
 * Queries the cache based on filtering parameters
 * @param {Object} params - Filter parameters
 * @param {Date} startDate - Start date for query
 * @param {Date} endDate - End date for query
 */
const queryCachedData = async (params, startDate, endDate) => {
  try {
    // Build query object from params
    const query = {};
    
    // Add filter parameters if they exist
    if (params.userId) query.userId = params.userId;
    if (params.buildingId) query.buildingId = params.buildingId;
    if (params.locationId) query.locationId = params.locationId;
    if (params.sensorType) query.sensorType = params.sensorType;
    if (params.sensorId) query.sensorId = params.sensorId;
    
    // Add time range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lt = endDate;
    }
    
    // Execute query
    const data = await SensorData.find(query).sort({ timestamp: 1 });
    return data;
  } catch (error) {
    console.error('Error querying cached data:', error);
    throw error;
  }
};

/**
 * Queries MySQL directly for data not in cache
 * @param {Object} params - Filter parameters
 * @param {Date} startDate - Start date for query 
 * @param {Date} endDate - End date for query
 */
const queryMySQLData = async (params, startDate, endDate) => {
  try {
    let query = 'SELECT * FROM sensor_data WHERE 1=1';
    const queryParams = [];
    
    // Add filter parameters if they exist
    if (params.userId) {
      query += ' AND user_id = ?';
      queryParams.push(params.userId);
    }
    
    if (params.buildingId) {
      query += ' AND building_id = ?';
      queryParams.push(params.buildingId);
    }
    
    if (params.locationId) {
      query += ' AND location_id = ?';
      queryParams.push(params.locationId);
    }
    
    if (params.sensorType) {
      query += ' AND sensor_type = ?';
      queryParams.push(params.sensorType);
    }
    
    if (params.sensorId) {
      query += ' AND sensor_id = ?';
      queryParams.push(params.sensorId);
    }
    
    // Add time range filter
    if (startDate) {
      query += ' AND timestamp >= ?';
      queryParams.push(startDate.toISOString().slice(0, 19).replace('T', ' '));
    }
    
    if (endDate) {
      query += ' AND timestamp < ?';
      queryParams.push(endDate.toISOString().slice(0, 19).replace('T', ' '));
    }
    
    query += ' ORDER BY timestamp ASC';
    
    // Execute query
    const [rows] = await mysqlPool.execute(query, queryParams);
    
    return rows.map(row => ({
      userId: row.user_id,
      buildingId: row.building_id,
      locationId: row.location_id,
      sensorType: row.sensor_type,
      sensorId: row.sensor_id,
      timestamp: row.timestamp,
      value: row.value
    }));
  } catch (error) {
    console.error('Error querying MySQL data:', error);
    throw error;
  }
};

module.exports = {
  cacheHourlyData,
  queryCachedData,
  queryMySQLData,
  generateHourKey
}; 
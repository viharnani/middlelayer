const { queryCachedData, queryMySQLData } = require('../services/cacheService');
const config = require('../config/config');

/**
 * Get sensor data based on filter parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSensorData = async (req, res) => {
  try {
    const {
      userId,
      buildingId,
      locationId,
      sensorType,
      sensorId,
      startDate,
      endDate
    } = req.query;
    
    // Validate that the number of parameters does not exceed the maximum
    const params = { userId, buildingId, locationId, sensorType, sensorId };
    const activeParams = Object.values(params).filter(Boolean);
    
    if (activeParams.length > config.cache.maxParams) {
      return res.status(400).json({
        success: false,
        message: `Maximum of ${config.cache.maxParams} filter parameters allowed`
      });
    }
    
    // Convert date strings to Date objects
    const parsedStartDate = startDate ? new Date(startDate) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;
    
    // Validate dates
    if (parsedStartDate && isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDate format'
      });
    }
    
    if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid endDate format'
      });
    }
    
    // Calculate cutoff date for cache (e.g., 1 month ago)
    const cacheStartDate = new Date();
    cacheStartDate.setDate(cacheStartDate.getDate() - config.cache.ttlDays);
    
    let data = [];
    
    // If requesting data from the cacheable time period
    if (!parsedStartDate || parsedStartDate >= cacheStartDate) {
      // Try to get data from cache
      data = await queryCachedData(params, parsedStartDate, parsedEndDate);
      
      // If no data in cache or it's incomplete, fetch from MySQL
      if (data.length === 0) {
        data = await queryMySQLData(params, parsedStartDate, parsedEndDate);
      }
    } else {
      // Query from MySQL directly for older data
      data = await queryMySQLData(params, parsedStartDate, parsedEndDate);
    }
    
    return res.json({
      success: true,
      count: data.length,
      data
    });
    
  } catch (error) {
    console.error('Error getting sensor data:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving sensor data'
    });
  }
};

module.exports = {
  getSensorData
}; 
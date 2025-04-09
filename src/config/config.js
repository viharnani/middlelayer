require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || 'sensor_data'
  },
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/sensor_cache'
  },
  cache: {
    ttlDays: parseInt(process.env.CACHE_TTL_DAYS || '30', 10),
    fetchIntervalHours: parseInt(process.env.DATA_FETCH_INTERVAL_HOURS || '1', 10),
    maxParams: parseInt(process.env.MAX_CACHE_PARAMS || '5', 10)
  }
}; 
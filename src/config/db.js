const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const config = require('./config');

// MySQL Connection Pool
const mysqlPool = mysql.createPool({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// MongoDB Connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
    
    // Create TTL index for automatic expiration of cache entries
    const db = mongoose.connection;
    await db.collection('sensordata').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: config.cache.ttlDays * 24 * 60 * 60 }
    );
    console.log('TTL index created successfully');
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = {
  mysqlPool,
  connectMongoDB
}; 
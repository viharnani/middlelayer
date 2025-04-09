# Sensor Data Middle Layer

A middleware solution that caches sensor data from MySQL to MongoDB with auto-updating and smart cache management.

## Features

- **Auto-Updating Cache**: Every hour, fetches the previous hour's data from MySQL and stores it in MongoDB
- **Smart Cache Management**: Filters data by up to 5 parameters (user, building, location, sensor type, etc.)
- **Automatic Cache Expiry**: Stores data in MongoDB with TTL (Time-To-Live) to automatically clear old data
- **Memory Optimization**: Prevents infinite growth by clearing older entries
- **API with Swagger Documentation**: RESTful API with interactive documentation

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables in `.env` file (use .env.example as a template)
4. Start the application:
   ```
   npm start
   ```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `MYSQL_HOST`: MySQL database host
- `MYSQL_USER`: MySQL database user
- `MYSQL_PASSWORD`: MySQL database password
- `MYSQL_DATABASE`: MySQL database name
- `MONGO_URI`: MongoDB connection string
- `CACHE_TTL_DAYS`: Days to keep data in cache (default: 30)
- `DATA_FETCH_INTERVAL_HOURS`: How often to fetch data from MySQL (default: 1)
- `MAX_CACHE_PARAMS`: Maximum number of parameters for filtering (default: 5)

## Usage

### API Endpoints

- `GET /api/data`: Fetch sensor data with query parameters
  - Query parameters: 
    - `userId`: Filter by user ID
    - `buildingId`: Filter by building ID
    - `locationId`: Filter by location ID
    - `sensorType`: Filter by sensor type
    - `sensorId`: Filter by sensor ID
    - `startDate`: Start date for filtering (ISO format)
    - `endDate`: End date for filtering (ISO format)

### Documentation

Access Swagger documentation at:
```
http://localhost:3000/api-docs
```

## Development

For development with auto-reload:
```
npm run dev
``` 
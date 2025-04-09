const express = require('express');
const router = express.Router();
const { getSensorData } = require('../controllers/dataController');

/**
 * @swagger
 * /api/data:
 *   get:
 *     summary: Retrieve sensor data
 *     description: Fetch sensor data with filtering capabilities
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID to filter by
 *       - in: query
 *         name: buildingId
 *         schema:
 *           type: string
 *         description: Building ID to filter by
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: string
 *         description: Location ID to filter by
 *       - in: query
 *         name: sensorType
 *         schema:
 *           type: string
 *         description: Sensor type to filter by
 *       - in: query
 *         name: sensorId
 *         schema:
 *           type: string
 *         description: Sensor ID to filter by
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for data retrieval (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for data retrieval (ISO format)
 *     responses:
 *       200:
 *         description: A list of sensor data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.get('/data', getSensorData);

module.exports = router; 
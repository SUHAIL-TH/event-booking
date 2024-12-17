const express = require('express');
const { initializeDatabase } = require('./config/config');
const { createRedisClient, connectRedis } = require('./services/redis');
const { syncModels } = require('./models/model');
const createRabbitMQService = require('./services/rabbit');
const eventRouter = require('./routes/eventRoutes'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
    try {
        // Ensure database is ready and test the connection
        await initializeDatabase();

        // Sync Models
        const { Event, Booking } = await syncModels();

        // Connect to Redis
        const redisClient = createRedisClient();
        await connectRedis(redisClient);

        // Connect to RabbitMQ
        const rabbitMQService = createRabbitMQService();
        const { channel: rabbitMQChannel } = await rabbitMQService.connect();
        await rabbitMQService.startConsumer(rabbitMQChannel);

        // Routes
        app.use('/api', eventRouter(Event, Booking, redisClient, rabbitMQChannel));

        // Global error handler
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ 
                message: 'An unexpected error occurred',
                error: process.env.NODE_ENV === 'development' ? err.message : {}
            });
        });

        // Start Server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Initialization Error:', error);
        process.exit(1);
    }
};

startServer();
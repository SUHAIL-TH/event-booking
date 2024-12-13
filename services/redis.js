const redis = require('redis');
require('dotenv').config();

// Redis Client Configuration
const createRedisClient = () => {
    const client = redis.createClient({
        host: process.env.DB_HOST,
        port: 6379,
        retry_strategy: (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
                return new Error('Redis server is down');
            }
            return 5000;
        }
    });

    client.on('connect', () => {
        console.log('Redis client connected');
    });

    client.on('error', (err) => {
        console.error('Redis Client Error', err);
    });

    return client;
};

// Async connection wrapper
const connectRedis = async (client) => {
    try {
        await client.connect();
        return client;
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        throw error;
    }
};

module.exports = {
    createRedisClient,
    connectRedis
};
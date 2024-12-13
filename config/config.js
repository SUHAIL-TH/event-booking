const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

// MySQL Configuration
const DB_NAME = 'event_booking_system';
const DB_USER = 'root';
const DB_PASSWORD = 'Suhail@123';
const DB_HOST = 'localhost';

// Create the database if it doesn't exist
const createDatabaseIfNotExists = async () => {
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        console.log(`Database "${DB_NAME}" is ready.`);
        await connection.end();
    } catch (error) {
        console.error('Error creating database:', error.message);
        throw error;
    }
};

// Sequelize Instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

// Test the database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
        throw error;
    }
};

// Initialize database and connection
const initializeDatabase = async () => {
    try {
        await createDatabaseIfNotExists();
        await testConnection();
    } catch (error) {
        console.error('Database Initialization Failed:', error.message);
        throw error;
    }
};

module.exports = {
    sequelize,
    initializeDatabase,
};

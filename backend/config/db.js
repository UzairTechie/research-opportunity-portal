const mysql = require('mysql2/promise');
require('dotenv').config();

// Create MySQL connection pool using environment variables
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'research_portal_db',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection on initialization
pool.getConnection()
    .then((connection) => {
        console.log('✅ Connected successfully to MySQL database:', process.env.DB_NAME || 'research_portal_db');
        connection.release();
    })
    .catch((err) => {
        console.error('❌ Failed to connect to MySQL database:', err.message);
        console.error('👉 Please make sure MySQL server is running and .env credentials are correct.');
    });

module.exports = pool;

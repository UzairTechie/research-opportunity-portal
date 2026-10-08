const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize database connection
require('./config/db');

// Import routes
const opportunityRoutes = require('./routes/opportunityRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/opportunities', opportunityRoutes);

// Health check / API status endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'University Research Opportunity Portal API is running smoothly.',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler for undefined API routes
app.all('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API route '${req.originalUrl}' not found.`
    });
});

// Fallback to frontend index.html for non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error occurred.',
        error: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Research Opportunity Portal Server is running!`);
    console.log(`📡 API Base URL:  http://localhost:${PORT}/api/opportunities`);
    console.log(`🌐 Frontend UI:   http://localhost:${PORT}`);
    console.log(`====================================================`);
});

module.exports = app;

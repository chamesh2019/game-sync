const express = require('express');
const path = require('path');

function setupRoutes(app) {
    // Serve static files from public directory
    app.use(express.static(path.join(__dirname, '..', 'public')));

    // Basic route for the main page
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // API endpoint to get current game state (for debugging)
    app.get('/api/gamestate', (req, res) => {
        const { gameState } = require('./game_state');
        res.json({
            playerCount: Object.keys(gameState.players).length,
            bulletCount: gameState.bullets.length,
            timestamp: new Date().toISOString()
        });
    });
}

module.exports = {
    setupRoutes
};

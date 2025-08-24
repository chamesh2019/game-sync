const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Import server components
const { setupRoutes } = require('./server_logic/routes');
const { setupSocketHandlers } = require('./server_logic/socket_handlers');
const { startGameLoop } = require('./server_logic/game_loop');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Setup routes
setupRoutes(app);

// Setup WebSocket handlers
setupSocketHandlers(io);

// Start the game loop
startGameLoop(io);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server is also running on the same port`);
});

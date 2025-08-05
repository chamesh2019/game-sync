const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle custom events
    socket.on('message', (data) => {
        console.log('Message received:', data);
        // Broadcast message to all connected clients
        io.emit('message', {
            id: socket.id,
            message: data.message,
            timestamp: new Date().toISOString()
        });
    });

    // Handle game sync events (example for game-sync project)
    socket.on('gameState', (data) => {
        console.log('Game state received:', data);
        // Broadcast game state to all other clients except sender
        socket.broadcast.emit('gameState', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        socket.broadcast.emit('gameState', {
            user_id: socket.id,
            pos: {
                x: -100,
                y: -100
            },
            color: '#ffffff'
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server is also running on the same port`);
});

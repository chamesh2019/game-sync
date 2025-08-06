const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Game state management
const gameState = {
    players: {},
    bullets: []
};

const BULLET_SPEED = 25;
const GAME_AREA = { width: 1920, height: 1080 }; // Reasonable game area size
const PLAYER_SIZE = 100; // Character width/height
const BULLET_SIZE = 4; // Bullet width/height

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Check collision between bullet and player
function checkCollision(bullet, player) {
    // Convert player position from string to number (remove 'px')
    const playerX = parseInt(player.pos.x.replace('px', ''));
    const playerY = parseInt(player.pos.y.replace('px', ''));
    
    // Simple AABB (Axis-Aligned Bounding Box) collision detection
    return bullet.x < playerX + PLAYER_SIZE &&
           bullet.x + BULLET_SIZE > playerX &&
           bullet.y < playerY + PLAYER_SIZE &&
           bullet.y + BULLET_SIZE > playerY;
}

// Bullet movement and cleanup logic
function updateBullets() {
    const collisions = [];
    
    gameState.bullets.forEach((bullet, bulletIndex) => {
        // Update bullet position
        bullet.x += BULLET_SPEED * Math.cos(bullet.angle * Math.PI / 180);
        bullet.y += BULLET_SPEED * Math.sin(bullet.angle * Math.PI / 180);
        
        // Check collisions with all players except the shooter
        for (let playerId in gameState.players) {
            if (playerId !== bullet.playerId) { // Don't hit your own bullets
                const player = gameState.players[playerId];
                if (checkCollision(bullet, player)) {
                    collisions.push({
                        bulletId: bullet.id,
                        shooterId: bullet.playerId,
                        hitPlayerId: playerId,
                        bulletPosition: { x: bullet.x, y: bullet.y },
                        playerPosition: { x: player.pos.x, y: player.pos.y }
                    });
                    // Mark bullet for removal by setting a flag
                    bullet.shouldRemove = true;
                    break; // Bullet can only hit one player
                }
            }
        }
    });

    // Remove bullets that hit players or went off-screen
    gameState.bullets = gameState.bullets.filter(bullet => {
        if (bullet.shouldRemove) return false;
        return bullet.x >= -50 && bullet.x <= GAME_AREA.width + 50 &&
               bullet.y >= -50 && bullet.y <= GAME_AREA.height + 50;
    });
    
    // Broadcast collisions if any occurred
    if (collisions.length > 0) {
        collisions.forEach(collision => {
            console.log(`Collision: Player ${collision.hitPlayerId} hit by ${collision.shooterId}`);
            io.emit('bulletCollision', collision);
        });
    }
}

// Game loop for server-side updates
setInterval(() => {
    updateBullets();
    // Broadcast updated bullet positions to all clients
    io.emit('bulletUpdate', gameState.bullets);
}, 1000 / 120); // 60 FPS updates

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Initialize player state
    gameState.players[socket.id] = {
        id: socket.id,
        pos: { x: '100px', y: '100px' },
        color: '#ffffff',
        barrelRotation: 0
    };

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

    socket.on('gameState', (data) => {
        // Update server-side player state
        gameState.players[socket.id] = data;
        // Broadcast game state to all other clients except sender
        socket.broadcast.emit('gameState', data);
    });

    // Handle bullet firing
    socket.on('fireBullet', (bulletData) => {
        console.log('Bullet fired:', bulletData);
        const bullet = {
            id: bulletData.id,
            x: bulletData.x,
            y: bulletData.y,
            angle: bulletData.angle,
            playerId: socket.id
        };
        gameState.bullets.push(bullet);
        // Broadcast new bullet to all clients
        io.emit('newBullet', bullet);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete gameState.players[socket.id];
        socket.broadcast.emit('gameState', {
            user_id: socket.id,
            pos: {
                x: '-100px',
                y: '-100px'
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

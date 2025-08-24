const { updateBullets } = require('./bullet_logic');
const { gameState } = require('./game_state');

let gameLoopInterval = null;
let bulletUpdateCounter = 0;

function startGameLoop(io) {
    // Stop existing loop if running
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
    }

    // Start the main game loop
    gameLoopInterval = setInterval(() => {
        // Update bullets (movement, collisions, cleanup)
        updateBullets(io);

        const connectedClients = io.sockets.sockets.size;
        if (connectedClients === 0) return;
        
        // Send bullet updates every 3 frames (40 FPS instead of 120 FPS) for smoother client interpolation
        bulletUpdateCounter++;
        if (bulletUpdateCounter >= 3) {
            bulletUpdateCounter = 0;
            if (gameState.bullets.length > 0) {
                io.emit("bulletUpdate", gameState.bullets);
            }
        }

        // Broadcast player states to all clients
        const playerCount = Object.keys(gameState.players).length;
        if (playerCount > 0) {
            io.emit("playerUpdate", gameState.players);
        }
        
        // Here you can add other game logic updates:
        // - Player health regeneration
        // - Power-ups
        // - Environmental effects
        // etc.
        
    }, 1000 / 120); // 120 FPS updates

    console.log('Game loop started at 120 FPS');
}

function stopGameLoop() {
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
        console.log('Game loop stopped');
    }
}

module.exports = {
    startGameLoop,
    stopGameLoop
};

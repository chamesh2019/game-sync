const { addPlayer, updatePlayer, removePlayer, addBullet, gameState } = require('./game_state');

function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
        
        // Initialize player state
        addPlayer(socket.id);
        
        // Send current game state to the newly connected player
        socket.emit('gameStateSync', gameState.players);
        
        // Notify other players about the new player
        socket.broadcast.emit('playerJoined', gameState.players[socket.id]);

        // Handle custom events
        socket.on('message', (data) => {
            console.log('Message received:', data);
            // Broadcast message to all connected clients
            io.emit('message', {
                id: socket.id,
                message: data.message,
                playerName: data.playerName,
                timestamp: new Date().toISOString()
            });
        });

        socket.on('gameState', (data) => {
            // Update server-side player state
            updatePlayer(socket.id, data);
            
            // Broadcast the updated player state to all other clients
            socket.broadcast.emit('playerStateUpdate', {
                playerId: socket.id,
                playerData: gameState.players[socket.id]
            });
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
            addBullet(bullet);
            // Broadcast new bullet to all clients
            io.emit('newBullet', bullet);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            removePlayer(socket.id);
            
            // Notify all clients about player disconnection
            io.emit('playerDisconnected', socket.id);
        });
    });
}

module.exports = {
    setupSocketHandlers
};

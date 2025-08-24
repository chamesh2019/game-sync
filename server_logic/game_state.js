// Game state management
const gameState = {
    players: {},
    bullets: []
};

function addPlayer(playerId) {
    gameState.players[playerId] = {
        id: playerId,
        name: 'Player', // Default name
        pos: { x: '100px', y: '100px' },
        barrelRotation: 0,
        health: 100
    };
}

function updatePlayer(playerId, data) {
    if (gameState.players[playerId]) {
        if (data.pos) {
            gameState.players[playerId].pos = data.pos;
        }
        if (typeof data.barrelRotation === 'number') {
            gameState.players[playerId].barrelRotation = data.barrelRotation;
        }
        if (typeof data.health === 'number') {
            gameState.players[playerId].health = data.health;
        }
        if (typeof data.color === 'string') {
            gameState.players[playerId].color = data.color;
        }
        if (typeof data.name === 'string') {
            gameState.players[playerId].name = data.name;
        }
    }
}

function removePlayer(playerId) {
    delete gameState.players[playerId];
}

function addBullet(bullet) {
    gameState.bullets.push(bullet);
}

function getGameState() {
    return gameState;
}

module.exports = {
    gameState,
    addPlayer,
    updatePlayer,
    removePlayer,
    addBullet,
    getGameState
};

// Socket connection and event handling
class SocketClient {
    constructor() {
        this.socket = io();
        this.playerName = 'Player'; // Default name
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to server with ID:', this.socket.id);
            // Hide loading indicator
            const loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';
            
            // Don't create character immediately - wait for name to be set
            console.log('Connected, waiting for player name...');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        // Game state events
        this.socket.on('gameStateSync', (players) => {
            console.log('Received initial game state:', players);
            if (window.PlayerManager) {
                PlayerManager.syncInitialPlayers(players, this.socket.id);
            }
        });

        this.socket.on('playerJoined', (playerData) => {
            console.log('New player joined:', playerData);
            if (playerData.id !== this.socket.id && window.PlayerManager) {
                PlayerManager.createPlayer(playerData);
            }
        });

        this.socket.on('playerStateUpdate', (data) => {
            if (data.playerId !== this.socket.id && window.PlayerManager) {
                PlayerManager.updatePlayer(data.playerData);
            }
        });

        this.socket.on('playerUpdate', (players) => {
            if (window.PlayerManager) {
                PlayerManager.updateAllPlayers(players, this.socket.id);
            }
        });

        this.socket.on('playerDisconnected', (playerId) => {
            console.log('Player disconnected:', playerId);
            if (window.PlayerManager) {
                PlayerManager.removePlayer(playerId);
            }
        });

        // Bullet events
        this.socket.on('newBullet', (bullet) => {
            if (window.BulletManager) {
                BulletManager.addBullet(bullet);
            }
        });

        this.socket.on('bulletUpdate', (serverBullets) => {
            if (window.BulletManager) {
                BulletManager.updateBullets(serverBullets);
            }
        });

        this.socket.on('bulletCollision', (collision) => {
            if (window.BulletManager) {
                BulletManager.handleCollision(collision, this.socket.id);
            }
        });

        // Message events
        this.socket.on('message', (data) => {
            if (window.MessageHandler) {
                MessageHandler.displayMessage(data);
            }
        });
    }

    createOwnCharacter() {
        // Create the player's own character
        const character = document.createElement('div');
        character.className = 'character';
        character.id = this.socket.id;
        character.style.position = 'absolute';
        character.style.left = '100px';
        character.style.top = '100px';
        character.style.backgroundColor = '#'+Math.floor(Math.random()*16777215).toString(16); // Random color

        // Create player name label
        const playerNameLabel = document.createElement('div');
        playerNameLabel.className = 'player-name';
        playerNameLabel.textContent = this.playerName;
        character.appendChild(playerNameLabel);

        // Create gun barrel
        const gunBarrel = document.createElement('div');
        gunBarrel.className = 'gun-barrel';
        gunBarrel.style.transform = 'rotate(0deg)';
        gunBarrel.style.zIndex = '1';
        gunBarrel.style.transformOrigin = '50% 100%';
        character.appendChild(gunBarrel);

        // Create gun head
        const gunHead = document.createElement('div');
        gunHead.className = 'gun-head';
        gunHead.style.zIndex = '2';
        character.appendChild(gunHead);

        // Add to screen
        const screen = document.getElementById('screen') || document.body;
        screen.appendChild(character);

        console.log('Created own character:', this.socket.id, 'with name:', this.playerName);
    }

    // Send events to server
    sendGameState(gameState) {
        // Include player name in game state
        gameState.name = this.playerName;
        this.socket.emit('gameState', gameState);
    }

    sendMessage(message) {
        this.socket.emit('message', { message, playerName: this.playerName });
    }

    fireBullet(bulletData) {
        this.socket.emit('fireBullet', bulletData);
    }

    setPlayerName(name) {
        this.playerName = name;
        console.log('Player name set to:', name);
        
        // Create own character now that we have a name
        this.createOwnCharacter();
        
        // Update own character name if it exists
        const ownCharacter = document.getElementById(this.socket.id);
        if (ownCharacter) {
            const nameLabel = ownCharacter.querySelector('.player-name');
            if (nameLabel) {
                nameLabel.textContent = name;
            }
        }
    }

    getId() {
        return this.socket.id;
    }

    disconnect() {
        this.socket.disconnect();
    }
}

// Create global socket instance and make it available globally
const socketClient = new SocketClient();
window.socketClient = socketClient;

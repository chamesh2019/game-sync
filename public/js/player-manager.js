// Player management and rendering
class PlayerManager {
    static players = new Map();

    static syncInitialPlayers(players, myId) {
        // Clear existing players first
        this.clearAllPlayers();
        
        // Add all players except self
        for (const playerId in players) {
            if (playerId !== myId) {
                this.createPlayer(players[playerId]);
            }
        }
    }

    static createPlayer(playerData) {
        const playerId = playerData.id || playerData.user_id;
        
        // Check if player already exists
        if (document.getElementById(playerId)) {
            this.updatePlayer(playerData);
            return;
        }

        // Create character element
        const character = document.createElement('div');
        character.className = 'character';
        character.id = playerId;
        character.style.position = 'absolute';
        character.style.left = playerData.pos.x;
        character.style.top = playerData.pos.y;
        character.style.backgroundColor = playerData.color || '#ffffff';

        // Create health bar container
        const healthBarContainer = document.createElement('div');
        healthBarContainer.className = 'health-bar-container';
        healthBarContainer.style.position = 'absolute';
        healthBarContainer.style.top = '-12px';
        healthBarContainer.style.left = '50%';
        healthBarContainer.style.transform = 'translateX(-50%)';
        healthBarContainer.style.width = '40px';
        healthBarContainer.style.height = '6px';
        healthBarContainer.style.background = '#333';
        healthBarContainer.style.borderRadius = '3px';
        healthBarContainer.style.overflow = 'hidden';

        // Create player name label
        const playerNameLabel = document.createElement('div');
        playerNameLabel.className = 'player-name';
        playerNameLabel.textContent = playerData.name || 'Player';
        character.appendChild(playerNameLabel);

        // Create health bar
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        healthBar.style.height = '100%';
        healthBar.style.background = '#4caf50';
        healthBar.style.width = `${(playerData.health !== undefined ? playerData.health : 100)}%`;
        healthBarContainer.appendChild(healthBar);

        character.appendChild(healthBarContainer);

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

        // Set initial barrel rotation
        if (playerData.barrelRotation !== undefined) {
            gunBarrel.style.transform = `rotate(${playerData.barrelRotation}deg)`;
        }

        // Add to screen
        const screen = document.getElementById('screen') || document.body;
        screen.appendChild(character);

        // Store player data
        this.players.set(playerId, playerData);
        
        console.log(`Created player: ${playerId}`);
    }

    static updatePlayer(playerData) {
        const playerId = playerData.id || playerData.user_id;
        const playerElement = document.getElementById(playerId);
        
        if (!playerElement) {
            // Player doesn't exist, create it
            this.createPlayer(playerData);
            return;
        }

        // Update position
        playerElement.style.left = playerData.pos.x;
        playerElement.style.top = playerData.pos.y;

        // Update color if changed
        if (playerData.color) {
            playerElement.style.backgroundColor = playerData.color;
        }

        // Update barrel rotation
        if (playerData.barrelRotation !== undefined) {
            const gunBarrel = playerElement.querySelector('.gun-barrel');
            if (gunBarrel) {
                gunBarrel.style.transform = `rotate(${playerData.barrelRotation}deg)`;
            }
        }

        // Update health bar
        if (playerData.health !== undefined) {
            const healthBar = playerElement.querySelector('.health-bar');
            if (healthBar) {
                const healthPercentage = Math.max(0, Math.min(100, playerData.health));
                healthBar.style.width = `${healthPercentage}%`;
                
                // Change color based on health
                if (healthPercentage > 75) {
                    healthBar.style.background = '#4caf50'; // Green
                } else if (healthPercentage > 50) {
                    healthBar.style.background = '#ff9800'; // Orange
                } else if (healthPercentage > 25) {
                    healthBar.style.background = '#f44336'; // Red
                } else {
                    healthBar.style.background = '#800000'; // Dark red
                }
            }
        }

        // Update player name
        if (playerData.name !== undefined) {
            const nameLabel = playerElement.querySelector('.player-name');
            if (nameLabel) {
                nameLabel.textContent = playerData.name;
            }
        }

        // Update stored data
        this.players.set(playerId, playerData);
    }

    static updateAllPlayers(players, myId) {
        for (const playerId in players) {
            if (playerId !== myId && playerId !== 'undefined') {
                this.updatePlayer(players[playerId]);
            } else if (playerId === myId) {
                // Update own health bar
                this.updateOwnHealth(players[playerId].health);
            }
        }
    }

    static updateOwnHealth(health) {
        const healthBarFill = document.getElementById('healthBarFill');
        const healthText = document.getElementById('healthText');
        
        if (healthBarFill && healthText) {
            const healthPercentage = Math.max(0, Math.min(100, health));
            healthBarFill.style.width = `${healthPercentage}%`;
            healthText.textContent = `${Math.round(health)}/100`;
            
            // Change color based on health
            if (healthPercentage > 75) {
                healthBarFill.style.background = 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 50%, #CDDC39 100%)';
            } else if (healthPercentage > 50) {
                healthBarFill.style.background = 'linear-gradient(90deg, #FF9800 0%, #FFC107 50%, #FFEB3B 100%)';
            } else if (healthPercentage > 25) {
                healthBarFill.style.background = 'linear-gradient(90deg, #F44336 0%, #FF5722 50%, #FF9800 100%)';
            } else {
                healthBarFill.style.background = 'linear-gradient(90deg, #800000 0%, #F44336 50%, #FF5722 100%)';
            }
            
            // Add pulse effect when health is low
            if (healthPercentage <= 25) {
                healthBarFill.style.animation = 'pulse 1s infinite';
            } else {
                healthBarFill.style.animation = 'none';
            }
            
            // Check if player died
            if (health <= 0) {
                window.socketClient.disconnect();
                this.showGameOverScreen();
            }
        }
    }

    static showGameOverScreen() {
        // Stop the game
        if (window.gameController) {
            window.gameController.stopGame();
        }

        // Create game over overlay
        const gameOverOverlay = document.createElement('div');
        gameOverOverlay.id = 'gameOverOverlay';
        gameOverOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: Arial, sans-serif;
        `;

        // Create "You Died" message
        const gameOverText = document.createElement('h1');
        gameOverText.textContent = 'YOU DIED';
        gameOverText.style.cssText = `
            font-size: 4rem;
            color: #ff4444;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            margin-bottom: 20px;
            animation: fadeInScale 1s ease-out;
        `;

        // Create restart button
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart Game';
        restartButton.style.cssText = `
            font-size: 1.2rem;
            padding: 15px 30px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
            transition: background 0.3s ease;
        `;

        restartButton.addEventListener('mouseenter', () => {
            restartButton.style.background = '#45a049';
        });

        restartButton.addEventListener('mouseleave', () => {
            restartButton.style.background = '#4CAF50';
        });

        restartButton.addEventListener('click', () => {
            this.restartGame();
        });

        // Add CSS animation for fade in effect
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInScale {
                0% {
                    opacity: 0;
                    transform: scale(0.5);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `;
        document.head.appendChild(style);

        gameOverOverlay.appendChild(gameOverText);
        gameOverOverlay.appendChild(restartButton);
        document.body.appendChild(gameOverOverlay);
    }

    static restartGame() {
        // Remove game over overlay
        const gameOverOverlay = document.getElementById('gameOverOverlay');
        if (gameOverOverlay) {
            gameOverOverlay.remove();
        }

        // Restart the game
        if (window.gameController) {
            window.gameController.restartGame();
        }

        // Reconnect to the server to reset player state
        if (window.socketClient) {
            window.socketClient.reconnect();
        }
    }

    static removePlayer(playerId) {
        const playerElement = document.getElementById(playerId);
        if (playerElement) {
            playerElement.remove();
            this.players.delete(playerId);
            console.log(`Removed player: ${playerId}`);
        }
    }

    static clearAllPlayers() {
        // Remove all player elements except own character
        const playerElements = document.querySelectorAll('.character');
        playerElements.forEach(element => {
            if (element.id !== (window.socketClient && window.socketClient.getId())) {
                element.remove();
            }
        });
        this.players.clear();
    }

    static getPlayer(playerId) {
        return this.players.get(playerId);
    }

    static getAllPlayers() {
        return this.players;
    }
}

// Make PlayerManager available globally
window.PlayerManager = PlayerManager;

// Game control and input handling
class GameController {
    constructor() {
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.isMoving = false;
        this.lastBulletTime = 0;
        this.bulletCooldown = 300; // 300ms between shots
        this.currentBarrelAngle = 0; // Track current barrel angle for smooth rotation
        this.firstInputReceived = false; // Track if user has given any input
        this.gameLoopInterval = null; // Store game loop interval ID
        this.isGameActive = false; // Track if game is active - start as false until name is entered
        this.playerName = ''; // Store player name
        
        this.setupNameInput();
        this.setupEventListeners();
        // Don't start game loop until name is entered
    }

    setupNameInput() {
        const nameInput = document.getElementById('nameInput');
        const nameSubmitBtn = document.getElementById('nameSubmitBtn');
        const nameClearBtn = document.getElementById('nameClearBtn');
        const nameModal = document.getElementById('nameModal');

        // Check if username is saved in localStorage
        const savedName = localStorage.getItem('gameSync_playerName');
        if (savedName && savedName.trim().length >= 2) {
            nameInput.value = savedName;
            nameSubmitBtn.disabled = false;
            nameClearBtn.style.display = 'inline-block';
        }

        // Handle name input
        const submitName = () => {
            const name = nameInput.value.trim();
            if (name.length >= 2) {
                this.playerName = name;
                
                // Save username to localStorage
                localStorage.setItem('gameSync_playerName', name);
                
                nameModal.style.display = 'none';
                this.isGameActive = true;
                this.startGameLoop();
                
                // Show loading while connecting
                const loading = document.getElementById('loading');
                if (loading) loading.style.display = 'block';
                
                // Initialize socket connection now that we have a name
                if (window.socketClient) {
                    window.socketClient.setPlayerName(this.playerName);
                }
                
                console.log(`Game started with player name: ${this.playerName}`);
            } else {
                alert('Please enter a name with at least 2 characters.');
            }
        };

        // Clear saved name
        const clearSavedName = () => {
            localStorage.removeItem('gameSync_playerName');
            nameInput.value = '';
            nameInput.placeholder = 'Your name';
            nameClearBtn.style.display = 'none';
            nameSubmitBtn.disabled = true;
            nameInput.focus();
        };

        // Submit on button click
        nameSubmitBtn.addEventListener('click', submitName);

        // Clear on clear button click
        nameClearBtn.addEventListener('click', clearSavedName);

        // Submit on Enter key
        nameInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                submitName();
            }
        });

        // Enable/disable submit button based on input
        nameInput.addEventListener('input', () => {
            const name = nameInput.value.trim();
            nameSubmitBtn.disabled = name.length < 2;
        });

        // Focus on input when modal is shown
        nameInput.focus();
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => {
            this.hideInstructionsOnFirstInput();
            this.keys[event.key.toLowerCase()] = true;
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });

        // Mouse events
        document.addEventListener('mousemove', (event) => {
            this.mousePos.x = event.clientX;
            this.mousePos.y = event.clientY;
        });

        document.addEventListener('click', (event) => {
            this.handleMouseClick(event);
        });

        // Prevent context menu on right click
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    hideInstructionsOnFirstInput() {
        if (!this.firstInputReceived) {
            this.firstInputReceived = true;
            const instructions = document.getElementById('instructions');
            if (instructions) {
                instructions.style.transition = 'opacity 0.5s ease-out';
                instructions.style.opacity = '0';
                setTimeout(() => {
                    instructions.remove();
                }, 500);
            }
        }
    }

    startGameLoop() {
        // Main game loop for local updates
        this.gameLoopInterval = setInterval(() => {
            if (this.isGameActive) {
                this.handleMovement();
                this.handleBarrelRotation();
            }
        }, 1000 / 60); // 60 FPS for smooth local movement
    }

    handleMovement() {
        if (!this.isGameActive) return;
        
        const character = document.getElementById(window.socketClient && window.socketClient.getId());
        if (!character) return;

        let moved = false;
        const speed = 5; // pixels per frame
        
        let newX = parseInt(character.style.left) || 0;
        let newY = parseInt(character.style.top) || 0;

        // Handle WASD movement
        if (this.keys['w'] || this.keys['arrowup']) {
            newY -= speed;
            moved = true;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            newY += speed;
            moved = true;
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            newX -= speed;
            moved = true;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            newX += speed;
            moved = true;
        }

        // Boundary checking
        const gameArea = { width: 1920, height: 1080 };
        newX = Math.max(0, Math.min(newX, gameArea.width - 100));
        newY = Math.max(0, Math.min(newY, gameArea.height - 100));

        if (moved) {
            // Update local position immediately for smooth movement
            character.style.left = `${newX}px`;
            character.style.top = `${newY}px`;
            
            // Send update to server
            this.sendPlayerUpdate(newX, newY);
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
    }

    handleBarrelRotation() {
        const character = document.getElementById(window.socketClient && window.socketClient.getId());
        if (!character) return;

        const characterRect = character.getBoundingClientRect();
        const characterCenterX = characterRect.left + characterRect.width / 2;
        const characterCenterY = characterRect.top + characterRect.height / 2;

        // Calculate target angle from character to mouse
        const deltaX = this.mousePos.x - characterCenterX;
        const deltaY = this.mousePos.y - characterCenterY;
        
        // Calculate angle in degrees, with 0 degrees pointing up (north)
        let targetAngle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);
        
        // Find the closest equivalent target angle to current angle (don't normalize to 0-360)
        const currentNormalized = this.currentBarrelAngle % 360;
        const targetNormalized = targetAngle % 360;
        
        // Calculate possible target angles (current "turn" and adjacent turns)
        const baseTurn = Math.floor(this.currentBarrelAngle / 360);
        const possibleTargets = [
            baseTurn * 360 + targetNormalized,           // Same turn
            (baseTurn - 1) * 360 + targetNormalized,     // Previous turn
            (baseTurn + 1) * 360 + targetNormalized      // Next turn
        ];
        
        // Choose the target angle closest to current angle
        let bestTarget = possibleTargets[0];
        let minDistance = Math.abs(this.currentBarrelAngle - possibleTargets[0]);
        
        for (let i = 1; i < possibleTargets.length; i++) {
            const distance = Math.abs(this.currentBarrelAngle - possibleTargets[i]);
            if (distance < minDistance) {
                minDistance = distance;
                bestTarget = possibleTargets[i];
            }
        }
        
        targetAngle = bestTarget;

        // Calculate the angle difference (no normalization needed)
        const angleDiff = targetAngle - this.currentBarrelAngle;
        
        // Smooth interpolation
        const rotationSpeed = 0.1;
        
        // If the angle difference is very small, snap to target to avoid jitter
        if (Math.abs(angleDiff) < 0.5) {
            this.currentBarrelAngle = targetAngle;
        } else {
            this.currentBarrelAngle += angleDiff * rotationSpeed;
        }

        // Update barrel rotation (normalize only for display)
        const gunBarrel = character.querySelector('.gun-barrel');
        if (gunBarrel) {
            gunBarrel.style.transform = `rotate(${this.currentBarrelAngle}deg)`;
        }

        // Send barrel rotation to server (normalize for network consistency)
        this.sendBarrelRotation(this.normalizeAngle(this.currentBarrelAngle));
    }

    // Normalize angle to 0-360 range
    normalizeAngle(angle) {
        while (angle < 0) angle += 360;
        while (angle >= 360) angle -= 360;
        return angle;
    }

    // Get the shortest angle difference between two angles
    getShortestAngleDifference(current, target) {
        // Normalize both angles to 0-360 range
        current = current % 360;
        if (current < 0) current += 360;
        
        target = target % 360;
        if (target < 0) target += 360;
        
        // Calculate the direct difference
        let diff = target - current;
        
        // Find the shortest path around the circle
        if (diff > 180) {
            diff = diff - 360;
        } else if (diff < -180) {
            diff = diff + 360;
        }
        
        return diff;
    }

    handleMouseClick(event) {
        if (!this.isGameActive) return;
        
        // Prevent firing too rapidly
        const currentTime = Date.now();
        if (currentTime - this.lastBulletTime < this.bulletCooldown) {
            return;
        }

        const character = document.getElementById(window.socketClient && window.socketClient.getId());
        if (!character) return;

        // Calculate bullet spawn position (from gun barrel tip)
        const characterRect = character.getBoundingClientRect();
        const characterCenterX = characterRect.left + characterRect.width / 2;
        const characterCenterY = characterRect.top + characterRect.height / 2;

        // Calculate angle and spawn position
        const deltaX = event.clientX - characterCenterX;
        const deltaY = event.clientY - characterCenterY;
        
        // Use the same angle calculation as barrel rotation for consistency
        const angle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);

        // Spawn bullet at barrel tip (50px from center in the direction of the barrel)
        const barrelLength = 50;
        const angleRad = angle * Math.PI / 180;
        const bulletX = characterCenterX + Math.sin(angleRad) * barrelLength;
        const bulletY = characterCenterY - Math.cos(angleRad) * barrelLength;

        // Create bullet data
        const bulletData = {
            id: `${window.socketClient.getId()}-${currentTime}`,
            x: bulletX,
            y: bulletY,
            angle: angle
        };

        // Send bullet to server
        window.socketClient.fireBullet(bulletData);
        this.lastBulletTime = currentTime;
    }

    sendPlayerUpdate(x, y) {
        const character = document.getElementById(window.socketClient && window.socketClient.getId());
        if (!character) return;

        const gunBarrel = character.querySelector('.gun-barrel');
        const barrelRotation = gunBarrel ? 
            parseFloat(gunBarrel.style.transform.replace('rotate(', '').replace('deg)', '')) || 0 : 0;

        const gameState = {
            id: window.socketClient.getId(),
            pos: { x: `${x}px`, y: `${y}px` },
            color: character.style.backgroundColor || '#ffffff',
            barrelRotation: barrelRotation
        };

        window.socketClient.sendGameState(gameState);
    }

    sendBarrelRotation(angle) {
        const character = document.getElementById(window.socketClient && window.socketClient.getId());
        if (!character) return;

        const gameState = {
            id: window.socketClient.getId(),
            pos: { 
                x: character.style.left, 
                y: character.style.top 
            },
            color: character.style.backgroundColor || '#ffffff',
            barrelRotation: angle
        };

        window.socketClient.sendGameState(gameState);
    }

    stopGame() {
        this.isGameActive = false;
        console.log('Game stopped');
    }

    restartGame() {
        window.location.reload();
    }
}

// Initialize game controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
});

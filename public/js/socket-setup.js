const socket = io();

socket.on("disconnect", () => {
  alert("server disconnected!!!");
});

socket.on("message", (data) => {
  alert(`User ${data.id}, ${data.message}, ${data.timestamp}`);
});

socket.on("playerUpdate", (data) => {
    for (const playerId in data) {
        if (playerId != undefined && playerId !== socket.id) {
            updateGameState(data[playerId]);
        }
    }
});

// Handle new bullets from server
socket.on("newBullet", (bullet) => {
    bulletList.push(bullet);
});

// Handle bullet position updates from server
socket.on("bulletUpdate", (serverBullets) => {
    // Update local bullet list with server positions
    bulletList = serverBullets.map(serverBullet => ({
        id: serverBullet.id,
        x: serverBullet.x,
        y: serverBullet.y,
        angle: serverBullet.angle,
        playerId: serverBullet.playerId
    }));
    
    // Remove DOM elements for bullets that no longer exist on server
    const existingBulletElements = document.querySelectorAll('.bullet');
    existingBulletElements.forEach(element => {
        const bulletId = element.id.replace('bullet-', '');
        const bulletExists = bulletList.some(bullet => bullet.id.toString() === bulletId);
        if (!bulletExists) {
            element.remove();
        }
    });
});

// Handle bullet collision events from server
socket.on("bulletCollision", (collision) => {
    console.log('Bullet collision detected:', collision);
    
    // Remove the bullet that hit
    const bulletElement = document.getElementById(`bullet-${collision.bulletId}`);
    if (bulletElement) {
        // Add a small explosion effect before removing
        bulletElement.style.backgroundColor = '#ff4444';
        bulletElement.style.transform = 'scale(2)';
        setTimeout(() => {
            bulletElement.remove();
        }, 100);
    }
    
    // Remove bullet from local list
    bulletList = bulletList.filter(bullet => bullet.id !== collision.bulletId);
    
    // Visual feedback for hit player
    const hitPlayer = document.getElementById(collision.hitPlayerId);
    if (hitPlayer) {
        // Add hit effect using CSS animation
        hitPlayer.classList.add('hit');
        setTimeout(() => {
            hitPlayer.classList.remove('hit');
        }, 300); // Match the animation duration
    }
    
    // Show collision message with better feedback
    if (collision.shooterId === socket.id) {
        console.log(`🎯 You hit player ${collision.hitPlayerId}!`);
        // Could add UI notification here
    } else if (collision.hitPlayerId === socket.id) {
        console.log(`💥 You were hit by player ${collision.shooterId}!`);
        // Could add screen shake or other effects here
    } else {
        console.log(`Player ${collision.shooterId} hit player ${collision.hitPlayerId}`);
    }
});

function sendGameState(gameState) {
  socket.emit("gameState", gameState);
}

function createOrUpdateCharacter(state) {
    const user = document.getElementById(state.id);
    if (user) {
        user.style.left = state.pos.x;
        user.style.top = state.pos.y;
        
        // Update barrel rotation if provided
        if (state.barrelRotation !== undefined) {
            updateBarrelRotation(state.id, state.barrelRotation);
        }
        return
    } ;

    const character = document.createElement('div');
    character.className = 'character';
    character.id = state.user_id;
    character.style.position = 'absolute';

    character.style.left = state.pos.x;
    character.style.top = state.pos.y;

    character.style.backgroundColor = state.color;

    // Create gun barrel for other players
    const gun_barrel = document.createElement('div');
    gun_barrel.className = 'gun-barrel';
    gun_barrel.style.transform = 'rotate(0deg)';
    gun_barrel.style.zIndex = '1';
    gun_barrel.style.transformOrigin = '50% 100%';
    character.appendChild(gun_barrel);

    const gun_head = document.createElement('div');
    gun_head.className = 'gun-head';
    gun_head.style.zIndex = '2';
    character.appendChild(gun_head);

    // Set initial barrel rotation if provided
    if (state.barrelRotation !== undefined) {
        gun_barrel.style.transform = `rotate(${state.barrelRotation}deg)`;
    }

    screen.appendChild(character);
}

function updateGameState(gameState) {
    createOrUpdateCharacter(gameState)
}
const { gameState, removePlayer } = require('./game_state');
const { BULLET_SPEED, GAME_AREA, PLAYER_SIZE, BULLET_SIZE, BULLET_DAMAGE } = require('./constants');

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

function updateBullets(io) {
  const collisions = [];

  gameState.bullets.forEach((bullet, bulletIndex) => {
    // Update bullet position
    // Convert angle to radians and use correct trigonometry for our coordinate system
    // In our system: 0 degrees = pointing up (north), angles increase clockwise
    const angleRad = (bullet.angle * Math.PI) / 180;
    bullet.x += BULLET_SPEED * Math.sin(angleRad);   // sin for x-component
    bullet.y -= BULLET_SPEED * Math.cos(angleRad);   // -cos for y-component (negative because y increases downward)

    // Check collisions with all players except the shooter
    for (let playerId in gameState.players) {
      if (playerId !== bullet.playerId) {
        // Don't hit your own bullets
        const player = gameState.players[playerId];
        if (checkCollision(bullet, player)) {
          collisions.push({
            bulletId: bullet.id,
            shooterId: bullet.playerId,
            hitPlayerId: playerId,
            bulletPosition: { x: bullet.x, y: bullet.y },
            playerPosition: { x: player.pos.x, y: player.pos.y },
          });
          // Mark bullet for removal by setting a flag
          bullet.shouldRemove = true;

          // Reduce player health
          player.health -= BULLET_DAMAGE;
          
          break; // Bullet can only hit one player
        }
      }
    }
  });

  // Remove bullets that hit players or went off-screen
  gameState.bullets = gameState.bullets.filter((bullet) => {
    if (bullet.shouldRemove) return false;
    return (
      bullet.x >= -50 &&
      bullet.x <= GAME_AREA.width + 50 &&
      bullet.y >= -50 &&
      bullet.y <= GAME_AREA.height + 50
    );
  });

  // Broadcast collisions if any occurred
  if (collisions.length > 0) {
    collisions.forEach((collision) => {
      io.emit("bulletCollision", collision);
    });
  }
}

module.exports = {
    updateBullets,
    checkCollision
};
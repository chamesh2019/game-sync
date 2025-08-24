const BULLET_SPEED = 15;
const GAME_AREA = { width: 1920, height: 1080 }; // Reasonable game area size
const PLAYER_SIZE = 100; // Character width/height
const BULLET_SIZE = 4; // Bullet width/height
const MAX_HEALTH = 100;
const HEALTH_REGEN_RATE = 1; // Health regeneration per second
const BULLET_DAMAGE = 20; // Damage per bullet hit
const BULLET_COOLDOWN = 300; // Minimum time between shots in ms

module.exports = {
    BULLET_SPEED,
    GAME_AREA,
    PLAYER_SIZE,
    BULLET_SIZE,
    MAX_HEALTH,
    HEALTH_REGEN_RATE,
    BULLET_DAMAGE,
    BULLET_COOLDOWN
};
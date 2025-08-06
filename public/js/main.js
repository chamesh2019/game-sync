function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const screen = document.getElementById('screen');
let user_id = 0;

let bulletList = [];
let lastBulletTime = 0;
const BULLET_COOLDOWN = 200; // 200ms between bullets

function createCharacter(user_id){
    const character = document.createElement('div');
    character.className = 'character';
    if (user_id) character.id = user_id;
    character.style.position = 'absolute';

    character.style.left = '100px';
    character.style.top = '100px';

    const r = Math.floor(Math.random() * 128 + 50);
    const g = Math.floor(Math.random() * 128 + 50);
    const b = Math.floor(Math.random() * 128 + 50);
    character.style.backgroundColor = `rgb(${r},${g},${b})`;

    screen.appendChild(character);
}

function moveCharacter(character, x, y) {
    character.style.left = `${x}px`;
    character.style.top = `${y}px`;
}

let pressedKeys = {};

function handleKeyDown(event) {
    pressedKeys[event.key.toLowerCase()] = true;
}

function handleKeyUp(event) {
    pressedKeys[event.key.toLowerCase()] = false;
}

function fireBullet() {
    const now = Date.now();
    if (now - lastBulletTime < BULLET_COOLDOWN) return; // Rate limiting
    
    const character = document.getElementById(user_id);
    const characterCenterX = parseInt(character.style.left) + 25; // Center of 50px character
    const characterCenterY = parseInt(character.style.top) + 25; // Center of 50px character

    const bulletData = {
        id: now,
        x: characterCenterX,
        y: characterCenterY,
        angle: currentBarrelAngle - 90 // Convert barrel rotation to movement direction
    };
    
    // Send bullet data to server instead of handling locally
    socket.emit('fireBullet', bulletData);
    
    lastBulletTime = now;
}

function drawBullets(){
    bulletList.forEach((bullet, index) => {
        const bulletElement = document.getElementById(`bullet-${bullet.id}`);
        if (bulletElement) {
            bulletElement.style.left = `${bullet.x}px`;
            bulletElement.style.top = `${bullet.y}px`;
        } else {
            const newBulletElement = document.createElement('div');
            newBulletElement.className = 'bullet';
            newBulletElement.id = `bullet-${bullet.id}`;
            newBulletElement.style.position = 'absolute';
            newBulletElement.style.left = `${bullet.x}px`;
            newBulletElement.style.top = `${bullet.y}px`;
            screen.appendChild(newBulletElement);
        }
    });
}

// Remove bullet from client-side rendering
function removeBullet(bulletId) {
    const bulletElement = document.getElementById(`bullet-${bulletId}`);
    if (bulletElement) {
        bulletElement.remove();
    }
    bulletList = bulletList.filter(bullet => bullet.id !== bulletId);
}

function gameLoop() {
    const character = document.getElementById(user_id);
    if (!character) return;

    let x = parseInt(character.style.left) || 0;
    let y = parseInt(character.style.top) || 0;

    let dx = 0, dy = 0;
    if (pressedKeys['w']) dy -= 4;
    if (pressedKeys['s']) dy += 4;
    if (pressedKeys['a']) dx -= 4;
    if (pressedKeys['d']) dx += 4;

    if (x + dx < 0) dx = -x; // Prevent going off-screen left
    if (x + dx > screen.clientWidth - 50) dx = screen.clientWidth - 50 - x;
    if (y + dy < 0) dy = -y; // Prevent going off-screen top
    if (y + dy > screen.clientHeight - 50) dy = screen.clientHeight - 50 - y;

    if (dx !== 0 || dy !== 0) {
        moveCharacter(character, x + dx, y + dy);
    }

    if (pressedKeys[' ']) {
        fireBullet();
    }

    drawBullets(); // Only draw, no longer update position locally
    
    requestAnimationFrame(gameLoop);
}

screen.addEventListener('keydown', handleKeyDown);
screen.addEventListener('keyup', handleKeyUp);

(async function waitForSocketId() {
    while (!socket.id) {
        await sleep(100);
    }
    user_id = socket.id;
    createCharacter(user_id);
    gameLoop();

    setInterval(() => {
        const character = document.getElementById(user_id);
        sendGameState({
            user_id: user_id,
            pos: {
                x: character.style.left,
                y: character.style.top
            },
            color: character.style.backgroundColor,
            barrelRotation: currentBarrelAngle,
            bulletList: bulletList
        })
    }, 10);
})();


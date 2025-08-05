function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const screen = document.getElementById('screen');
let user_id = 0;

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

    if (dx !== 0 || dy !== 0) {
        moveCharacter(character, x + dx, y + dy);
        sendGameState({
            user_id: user_id,
            pos: {
                x: character.style.left,
                y: character.style.top
            },
            color: character.style.backgroundColor
        })
    }

    requestAnimationFrame(gameLoop);
}

screen.addEventListener('keydown', handleKeyDown);
screen.addEventListener('keyup', handleKeyUp);

setTimeout(() => {
    user_id = socket.id;
    createCharacter(user_id);
    gameLoop();
}, 500);
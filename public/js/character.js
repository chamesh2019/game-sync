// Track the current angle to prevent spinning
let currentBarrelAngle = 0;

function spinBarrel(characterPos, mousePos) {
    const gun_barrel = document.querySelector('#gun-barrel');
    if (!gun_barrel) return;

    document.getElementById('mouseX').setAttribute('data-mouseX', mousePos.x);
    document.getElementById('mouseY').setAttribute('data-mouseY', mousePos.y);
    
    // Calculate angle from character center to mouse position
    const deltaX = mousePos.x - characterPos.x;
    const deltaY = mousePos.y - characterPos.y;
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    
    // Adjust angle so barrel points towards mouse (add 90 degrees to align properly)
    let targetAngle = angle + 90;
    
    // Calculate the difference between current and target angle
    let angleDifference = targetAngle - currentBarrelAngle;
    
    // Normalize angle difference to be between -180 and 180 (shortest path)
    while (angleDifference > 180) angleDifference -= 360;
    while (angleDifference < -180) angleDifference += 360;
    
    // Update current angle by the normalized difference
    currentBarrelAngle += angleDifference;
    
    gun_barrel.style.transform = `rotate(${currentBarrelAngle}deg)`;
}

// Function to update barrel rotation for other players
function updateBarrelRotation(characterId, angle) {
    const character = document.getElementById(characterId);
    if (!character) return;
    
    const gun_barrel = character.querySelector('.gun-barrel');
    if (gun_barrel) {
        gun_barrel.style.transform = `rotate(${angle}deg)`;
    }
}


(async function waitForSocketId() {
    while (!socket.id) {
        await sleep(100);
    }
    await sleep(100);

    character = document.getElementById(socket.id);

    const gun_barrel = document.createElement('div');
    const gun_head = document.createElement('div');

    gun_barrel.className = 'gun-barrel';
    gun_barrel.id = 'gun-barrel';
    gun_barrel.style.transform = 'rotate(0deg)';
    gun_barrel.style.zIndex = '1';
    gun_barrel.style.transformOrigin = '50% 100%'; // Bottom center of barrel at character center

    gun_head.className = 'gun-head';
    gun_head.style.zIndex = '2';
    character.appendChild(gun_barrel);
    character.appendChild(gun_head);

    screen.addEventListener('mousemove', (event) => {
        // Get the bounding rectangle of the character element
        const rect = character.getBoundingClientRect();
        // Calculate the center position of the character
        const characterPos = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        // Get the mouse position relative to the viewport
        const mousePos = {
            x: event.clientX,
            y: event.clientY
        };
        spinBarrel(characterPos, mousePos);
    });

})();

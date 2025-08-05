const socket = io();

socket.on("disconnect", () => {
  alert("server disconnected!!!");
});

socket.on("message", (data) => {
  alert(`User ${data.id}, ${data.message}, ${data.timestamp}`);
});

socket.on("gameState", (data) => {
    updateGameState(data);
});

function sendGameState(gameState) {
  socket.emit("gameState", gameState);
}

function createOrUpdateCharacter(state) {
    const user = document.getElementById(state.user_id);
    if (user) {
        user.style.left = state.pos.x;
        user.style.top = state.pos.y;
        return
    } ;

    const character = document.createElement('div');
    character.className = 'character';
    character.id = state.user_id;
    character.style.position = 'absolute';

    character.style.left = state.pos.x;
    character.style.top = state.pos.y;

    character.style.backgroundColor = state.color;

    screen.appendChild(character);
}

function updateGameState(gameState) {
    createOrUpdateCharacter(gameState)
}
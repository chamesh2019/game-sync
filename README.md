# Game Sync - Multiplayer Tank Shooter

A real-time multiplayer tank shooter game built with Node.js, featuring Express web server and Socket.io WebSocket functionality. Players control tank-like characters, move around the battlefield, and engage in combat with bullet physics and collision detection.

## Features

- **Real-time Multiplayer Gameplay** - Multiple players can join and play simultaneously  
- **Tank Movement** - Smooth character movement with WASD controls
- **Bullet Physics** - Realistic bullet trajectories and server-side physics simulation
- **Collision Detection** - Server-authoritative hit detection between bullets and players
- **Visual Effects** - Hit animations, bullet explosions, and player feedback
- **Express Web Server** - Serves static files and game client
- **Socket.io WebSocket Server** - Ultra-low latency real-time communication
- **Integrated Architecture** - Both servers run on the same port for easy deployment

## Installation

1. Clone or download this project
2. Install dependencies:
```bash
npm install
```

## Usage

### Starting the Server

```bash
npm start
```

The server will start on `http://localhost:3000` by default.

### Playing the Game

1. Open your browser and navigate to `http://localhost:3000`
2. You'll see your tank character appear on the screen
3. **Controls:**
   - **WASD** - Move your tank around the battlefield
   - **Mouse** - Aim your tank's barrel (automatically tracks mouse cursor)  
   - **Spacebar** - Fire bullets (rate limited to prevent spam)
4. Open multiple browser tabs or share the URL to play with friends
5. Try to hit other players with your bullets while avoiding their shots!

### Development Mode

```bash
npm run dev
```

For development, this runs the same as `npm start` - you can modify files and restart as needed.

## Project Structure

```
game-sync/
├── server.js                    # Main server file with game logic
├── package.json                 # Project configuration and dependencies
├── public/                      # Client-side game files
│   ├── index.html              # Game client HTML structure
│   ├── css/                    # Stylesheets
│   │   ├── base.css           # Base game styling
│   │   └── character.css      # Tank character and bullet styling
│   └── js/                    # Client-side game logic
│       ├── main.js            # Game loop, controls, and bullet handling
│       ├── character.js       # Character creation and tank barrel rotation
│       └── socket-setup.js    # Socket.io client setup and event handlers
└── README.md                   # Project documentation
```

## WebSocket Events

### Client to Server Events

- **`gameState`** - Send player position, tank barrel rotation, and color updates
  ```javascript
  socket.emit('gameState', {
      user_id: 'player-id',
      pos: { x: '100px', y: '150px' },
      color: 'rgb(100,150,200)',
      barrelRotation: 45  // degrees
  });
  ```

- **`fireBullet`** - Fire a bullet from the player's tank
  ```javascript
  socket.emit('fireBullet', {
      id: timestamp,
      x: 125,  // bullet start X position
      y: 175,  // bullet start Y position  
      angle: 45  // bullet trajectory angle in degrees
  });
  ```

- **`message`** - Send chat messages (legacy feature)
  ```javascript
  socket.emit('message', { message: 'Hello!' });
  ```

### Server to Client Events

- **`gameState`** - Receive other players' position and tank updates
  ```javascript
  socket.on('gameState', (data) => {
      // Update other player's position and barrel rotation
      updatePlayerDisplay(data);
  });
  ```

- **`newBullet`** - A new bullet has been fired by any player
  ```javascript
  socket.on('newBullet', (bullet) => {
      // Add bullet to client-side rendering
      // { id, x, y, angle, playerId }
  });
  ```

- **`bulletUpdate`** - Server-authoritative bullet position updates
  ```javascript
  socket.on('bulletUpdate', (bullets) => {
      // Array of all active bullets with current positions
      // Updates at 120 FPS for smooth physics
  });
  ```

- **`bulletCollision`** - A bullet hit a player (collision detected on server)
  ```javascript
  socket.on('bulletCollision', (collision) => {
      // { bulletId, shooterId, hitPlayerId, bulletPosition, playerPosition }
      // Show hit effects and remove bullet from display
  });
  ```

- **`connect`** - Successfully connected to the game server
- **`disconnect`** - Connection to server lost

## Game Mechanics

### Movement System
- Players move using WASD keys at 4 pixels per frame
- Boundary checking prevents players from moving off-screen
- Position updates are sent to server every 10ms for smooth multiplayer sync

### Bullet System
- **Firing Rate:** 200ms cooldown between shots (5 shots/second max)
- **Physics:** Bullets travel at 25 pixels per frame with realistic trajectories
- **Server Authority:** All bullet positions and collisions calculated server-side
- **Collision Detection:** AABB (Axis-Aligned Bounding Box) collision detection
- **Auto-cleanup:** Bullets are removed when they go off-screen or hit players

### Tank Controls
- **Barrel Aiming:** Tank barrels automatically track your mouse cursor
- **Visual Feedback:** Hit players flash red with scale animation
- **Collision Effects:** Bullets explode with visual effects on impact

## Example Integration

### Basic Player Movement
```javascript
// This happens automatically with WASD controls
socket.emit('gameState', {
    user_id: socket.id,
    pos: { x: '200px', y: '300px' },
    color: 'rgb(150,100,200)',
    barrelRotation: 90
});
```

### Firing Bullets
```javascript
// Triggered automatically with spacebar
function fireBullet() {
    const bulletData = {
        id: Date.now(),
        x: playerCenterX,
        y: playerCenterY, 
        angle: barrelAngle - 90  // Convert to movement direction
    };
    socket.emit('fireBullet', bulletData);
}
```

### Handling Collisions
```javascript
socket.on('bulletCollision', (collision) => {
    if (collision.hitPlayerId === socket.id) {
        console.log('You were hit!');
        // Add screen shake, damage effects, etc.
    }
});
```

## Configuration

### Server Settings
The server port can be configured using the `PORT` environment variable:

```bash
PORT=8080 npm start
```

### Game Constants (in server.js)
- `BULLET_SPEED`: 25 pixels per frame
- `GAME_AREA`: { width: 1920, height: 1080 }
- `PLAYER_SIZE`: 100px (character width/height)  
- `BULLET_SIZE`: 4px (bullet width/height)
- `BULLET_COOLDOWN`: 200ms between shots

### Performance Settings
- Client game loop: 60 FPS (`requestAnimationFrame`)
- Server bullet updates: 120 FPS for smooth physics
- Player state sync: Every 10ms for responsive multiplayer

## Dependencies

- **express** `^5.1.0` - Fast, unopinionated web framework for Node.js
- **socket.io** `^4.8.1` - Real-time bidirectional event-based communication

### Client-Side Dependencies (CDN)
- **Socket.io Client** - Loaded automatically from `/socket.io/socket.io.js`

## Browser Compatibility

This multiplayer tank game works on all modern browsers that support:
- **WebSocket API** (all browsers from 2012+)
- **Canvas and CSS3 transforms** for smooth animations
- **ES6+ JavaScript features**

Tested on:
- **Chrome 90+** ✅ 
- **Firefox 88+** ✅
- **Safari 14+** ✅
- **Edge 90+** ✅

## Development

### Adding New Features
- **Client-side game logic:** Edit files in `public/js/`
- **Server-side physics:** Modify `server.js`
- **Styling:** Update CSS files in `public/css/`

### Performance Optimization
- Server runs bullet physics at 120 FPS for accuracy
- Client rendering optimized with `requestAnimationFrame`
- Socket.io automatically handles connection reliability and fallbacks

### Troubleshooting
- **Port already in use:** Change the PORT environment variable
- **Players not syncing:** Check browser console for WebSocket errors  
- **Bullets not appearing:** Verify server.js is running and accessible

## License

ISC

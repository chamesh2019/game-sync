# Game Sync - WebSocket & Web Server

A Node.js application that combines an Express web server with Socket.io WebSocket functionality for real-time communication. Perfect for game synchronization, chat applications, and any real-time data exchange.

## Features

- **Express Web Server** - Serves static files and handles HTTP requests
- **Socket.io WebSocket Server** - Real-time bidirectional communication
- **Integrated Architecture** - Both servers run on the same port
- **Demo Client** - Interactive web interface to test WebSocket functionality
- **Game State Sync** - Example implementation for real-time game synchronization

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

### Development

```bash
npm run dev
```

### Testing the WebSocket Connection

1. Open your browser and navigate to `http://localhost:3000`
2. You'll see the demo client interface
3. Open multiple browser tabs to test real-time communication
4. Send messages and game states to see them synchronized across all connected clients

## Project Structure

```
game-sync/
├── server.js              # Main server file
├── public/
│   └── index.html         # Demo client interface
├── package.json           # Project configuration
└── README.md             # This file
```

## WebSocket Events

### Client to Server
- `message` - Send a chat message
- `gameState` - Send game state data for synchronization

### Server to Client
- `message` - Receive chat messages from other users
- `gameState` - Receive game state updates from other players
- `connect` - Connection established
- `disconnect` - Connection lost

## Example Usage

### Sending a Message
```javascript
socket.emit('message', { message: 'Hello, world!' });
```

### Sending Game State
```javascript
socket.emit('gameState', {
    level: 5,
    score: 1200,
    position: { x: 100, y: 200 }
});
```

### Receiving Events
```javascript
socket.on('message', (data) => {
    console.log('New message:', data.message);
});

socket.on('gameState', (data) => {
    console.log('Game state update:', data);
});
```

## Configuration

The server port can be configured using the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Dependencies

- **express** - Fast, unopinionated web framework for Node.js
- **socket.io** - Real-time bidirectional event-based communication

## Browser Compatibility

This project uses Socket.io which supports all modern browsers including:
- Chrome 10+
- Firefox 3.6+
- Safari 5+
- Internet Explorer 8+

## License

ISC

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Game Sync Project Instructions

This is a Node.js project that combines an Express web server with Socket.io WebSocket functionality for real-time communication. The project is designed for game synchronization and real-time messaging.

## Project Structure
- `server.js` - Main server file combining HTTP and WebSocket servers
- `public/` - Static files served by the web server
- `public/index.html` - Client-side demo page for testing WebSocket functionality

## Key Technologies
- **Express.js** - Web server framework
- **Socket.io** - WebSocket library for real-time communication
- **Node.js** - Runtime environment

## Development Guidelines
- Use ES6+ features where appropriate
- Follow Node.js best practices for error handling
- Implement proper WebSocket event handling
- Ensure all routes return appropriate HTTP status codes
- Use environment variables for configuration when needed

## WebSocket Events
- `message` - For general messaging
- `gameState` - For game state synchronization
- `connection` and `disconnect` - For client lifecycle management

// Message handling and chat functionality
class MessageHandler {
    static displayMessage(data) {
        console.log(`Message from ${data.id}: ${data.message} at ${data.timestamp}`);
        
        // You can customize this to show messages in a chat UI instead of alerts
        // For now, using console.log instead of alert for better UX
        this.showChatMessage(data);
    }

    static showChatMessage(data) {
        // Create or get chat container
        let chatContainer = document.getElementById('chat-container');
        if (!chatContainer) {
            chatContainer = this.createChatContainer();
        }

        // Get player name if available, otherwise use shortened socket ID
        let displayName = data.playerName || data.id.substring(0, 8);
        
        // If it's the current player, add "(You)" indicator
        if (window.socketClient && data.id === window.socketClient.getId()) {
            displayName = `${displayName} (You)`;
        }

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `
            <span class="chat-timestamp">${new Date(data.timestamp).toLocaleTimeString()}</span>
            <span class="chat-sender">${displayName}:</span>
            <span class="chat-content">${data.message}</span>
        `;

        // Add to chat container
        chatContainer.appendChild(messageElement);

        // Auto-scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Remove old messages if too many
        const messages = chatContainer.querySelectorAll('.chat-message');
        if (messages.length > 50) {
            messages[0].remove();
        }

        // Auto-hide message after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.opacity = '0.5';
            }
        }, 5000);
    }

    static createChatContainer() {
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chat-container';
        chatContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 300px;
            max-height: 200px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px;
            border-radius: 5px;
            overflow-y: auto;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
            display: none;
        `;

        // Add CSS for chat messages
        const style = document.createElement('style');
        style.textContent = `
            .chat-message {
                margin-bottom: 5px;
                line-height: 1.3;
            }
            .chat-timestamp {
                color: #888;
                font-size: 10px;
            }
            .chat-sender {
                color: #4CAF50;
                font-weight: bold;
            }
            .chat-content {
                color: white;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(chatContainer);
        return chatContainer;
    }

    static sendMessage(message) {
        if (message.trim() && window.socketClient) {
            window.socketClient.sendMessage(message);
        }
    }

    static toggleChat() {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.style.display = 
                chatContainer.style.display === 'none' ? 'block' : 'none';
        }
    }
}

// Add chat input functionality
document.addEventListener('DOMContentLoaded', () => {
    // Create chat input
    const chatInput = document.createElement('input');
    chatInput.type = 'text';
    chatInput.id = 'chat-input';
    chatInput.placeholder = 'Press Enter to chat...';
    chatInput.style.cssText = `
        position: fixed;
        bottom: 230px;
        left: 20px;
        width: 280px;
        padding: 5px;
        border: none;
        border-radius: 3px;
        background-color: rgba(255, 255, 255, 0.9);
        display: none;
        z-index: 1001;
    `;

    document.body.appendChild(chatInput);

    // Chat input event handlers
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const message = chatInput.value.trim();
            if (message) {
                MessageHandler.sendMessage(message);
                chatInput.value = '';
                chatInput.style.display = 'none';
            }
        } else if (event.key === 'Escape') {
            chatInput.style.display = 'none';
            chatInput.value = '';
        }
    });

    // Global key handler for chat
    document.addEventListener('keypress', (event) => {
        if (event.key === '`' && document.activeElement !== chatInput) {
            event.preventDefault();
            MessageHandler.toggleChat();
            chatInput.style.display = 'block';
            chatInput.focus();
        }
    });
});

// Make MessageHandler available globally
window.MessageHandler = MessageHandler;

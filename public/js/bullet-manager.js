// Bullet management and rendering
class BulletManager {
    static bullets = [];
    static bulletSpeed = 25 / 2; // Server moves at 25px per 1/120s, client at 60fps, so 25 * (60/120) = 12.5 px per frame
    static animationFrameId = null;

    static init() {
        this.startLocalBulletLoop();
    }

    static startLocalBulletLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        const updateLoop = () => {
            this.updateLocalBullets();
            this.animationFrameId = requestAnimationFrame(updateLoop);
        };
        
        this.animationFrameId = requestAnimationFrame(updateLoop);
    }

    static updateLocalBullets() {
        // Update bullet positions locally for smooth movement
        this.bullets.forEach(bullet => {
            if (bullet.lastServerUpdate && Date.now() - bullet.lastServerUpdate < 5000) {
                // Move bullet locally using the same physics as server
                const angleRad = (bullet.angle * Math.PI) / 180;
                bullet.x += this.bulletSpeed * Math.sin(angleRad);
                bullet.y -= this.bulletSpeed * Math.cos(angleRad);
                
                this.updateBulletElement(bullet);
            }
        });
    }

    static addBullet(bullet) {
        // Add timestamp for local tracking
        bullet.lastServerUpdate = Date.now();
        this.bullets.push(bullet);
        this.createBulletElement(bullet);
    }

    static updateBullets(serverBullets) {
        // Update local bullet list with server positions and sync them
        const updatedBullets = serverBullets.map(serverBullet => {
            // Find existing bullet
            const existingBullet = this.bullets.find(b => b.id === serverBullet.id);
            
            if (existingBullet) {
                // Update with server data but maintain smooth movement
                existingBullet.x = serverBullet.x;
                existingBullet.y = serverBullet.y;
                existingBullet.angle = serverBullet.angle;
                existingBullet.playerId = serverBullet.playerId;
                existingBullet.lastServerUpdate = Date.now();
                return existingBullet;
            } else {
                // New bullet from server
                const newBullet = {
                    id: serverBullet.id,
                    x: serverBullet.x,
                    y: serverBullet.y,
                    angle: serverBullet.angle,
                    playerId: serverBullet.playerId,
                    lastServerUpdate: Date.now()
                };
                this.createBulletElement(newBullet);
                return newBullet;
            }
        });

        this.bullets = updatedBullets;

        // Update bullet positions in DOM
        this.bullets.forEach(bullet => {
            this.updateBulletElement(bullet);
        });

        // Remove DOM elements for bullets that no longer exist on server
        this.cleanupOldBullets();
    }

    static createBulletElement(bullet) {
        // Check if bullet element already exists
        if (document.getElementById(`bullet-${bullet.id}`)) {
            return;
        }

        const bulletElement = document.createElement('div');
        bulletElement.className = 'bullet';
        bulletElement.id = `bullet-${bullet.id}`;
        bulletElement.style.position = 'absolute';
        bulletElement.style.left = `${bullet.x}px`;
        bulletElement.style.top = `${bullet.y}px`;
        bulletElement.style.width = '8px';
        bulletElement.style.height = '8px';
        bulletElement.style.backgroundColor = '#5a2c1cff';
        bulletElement.style.borderRadius = '50%';
        bulletElement.style.zIndex = '10';

        // Hide bullet if it's outside the viewport
        const isOutOfViewport = this.isBulletOutOfViewport(bullet);
        bulletElement.style.display = isOutOfViewport ? 'none' : 'block';

        const screen = document.getElementById('screen') || document.body;
        screen.appendChild(bulletElement);
    }

    static updateBulletElement(bullet) {
        const bulletElement = document.getElementById(`bullet-${bullet.id}`);
        if (bulletElement) {
            bulletElement.style.left = `${bullet.x}px`;
            bulletElement.style.top = `${bullet.y}px`;
            
            // Hide bullet if it's outside the viewport
            const isOutOfViewport = this.isBulletOutOfViewport(bullet);
            bulletElement.style.display = isOutOfViewport ? 'none' : 'block';
        } else {
            // Create element if it doesn't exist
            this.createBulletElement(bullet);
        }
    }

    static cleanupOldBullets() {
        const existingBulletElements = document.querySelectorAll('.bullet');
        existingBulletElements.forEach(element => {
            const bulletId = element.id.replace('bullet-', '');
            const bulletExists = this.bullets.some(bullet => bullet.id.toString() === bulletId);
            if (!bulletExists) {
                element.remove();
            }
        });
    }

    static removeBullet(bulletId) {
        // Remove from local array
        this.bullets = this.bullets.filter(bullet => bullet.id !== bulletId);
        
        // Remove DOM element
        const bulletElement = document.getElementById(`bullet-${bulletId}`);
        if (bulletElement) {
            bulletElement.remove();
        }
    }

    static handleCollision(collision, mySocketId) {
        console.log('Bullet collision detected:', collision);
        
        // Add explosion effect to bullet
        const bulletElement = document.getElementById(`bullet-${collision.bulletId}`);
        if (bulletElement) {
            bulletElement.style.backgroundColor = '#ff4444';
            bulletElement.style.transform = 'scale(2)';
            bulletElement.style.boxShadow = '0 0 10px #ff4444';
            
            setTimeout(() => {
                bulletElement.remove();
            }, 100);
        }
        
        // Remove bullet from local list
        this.removeBullet(collision.bulletId);
        
        // Add hit effect to player
        const hitPlayer = document.getElementById(collision.hitPlayerId);
        if (hitPlayer) {
            this.addHitEffect(hitPlayer);
        }
        
        // Show collision notifications
        this.showCollisionNotification(collision, mySocketId);
    }

    static addHitEffect(playerElement) {
        // Add hit effect using CSS animation
        playerElement.classList.add('hit');
        
        // Add screen shake effect if it's the current player
        if (playerElement.id === (window.socketClient && window.socketClient.getId())) {
            document.body.classList.add('screen-shake');
            setTimeout(() => {
                document.body.classList.remove('screen-shake');
            }, 300);
        }
        
        setTimeout(() => {
            playerElement.classList.remove('hit');
        }, 300);
    }

    static showCollisionNotification(collision, mySocketId) {
        if (collision.shooterId === mySocketId) {
            console.log(`🎯 You hit player ${collision.hitPlayerId}!`);
            this.showNotification('Hit!', '#4CAF50');
        } else if (collision.hitPlayerId === mySocketId) {
            console.log(`💥 You were hit by player ${collision.shooterId}!`);
            this.showNotification('You were hit!', '#F44336');
        } else {
            console.log(`Player ${collision.shooterId} hit player ${collision.hitPlayerId}`);
        }
    }

    static showNotification(message, color) {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = color;
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.style.fontWeight = 'bold';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';

        document.body.appendChild(notification);

        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        // Fade out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    static isBulletOutOfViewport(bullet) {
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Bullet dimensions (8px as defined in createBulletElement)
        const bulletSize = 8;
        
        // Check if bullet is completely outside viewport bounds
        return (
            bullet.x + bulletSize < 0 ||           // Left of viewport
            bullet.x > viewportWidth ||            // Right of viewport
            bullet.y + bulletSize < 0 ||           // Above viewport
            bullet.y > viewportHeight              // Below viewport
        );
    }

    static getBullets() {
        return this.bullets;
    }

    static clearAllBullets() {
        this.bullets = [];
        const bulletElements = document.querySelectorAll('.bullet');
        bulletElements.forEach(element => element.remove());
        
        // Stop the animation loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}

// Make BulletManager available globally and initialize
window.BulletManager = BulletManager;

// Initialize the bullet manager when the script loads
document.addEventListener('DOMContentLoaded', () => {
    BulletManager.init();
});

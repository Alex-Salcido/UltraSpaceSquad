class RestartGame {
    constructor(game) {
        this.game = game;
    }

    restart() {
        // Stop the animation loop by setting gameOver temporarily
        this.game.gameOver = true;

        // Hide game over menu
        this.game.ui.gameOverMenu.style.display = 'none';

        // Reset game state
        this.game.player.score = 0;
        this.game.player.lives = 3;
        this.game.trackPosition = 0;
        this.game.bossSpawned = false;
        this.game.bossLevelDefeated = false; // Reset this too
        this.game.player.invincibilityTimer = 0;
        this.game.player.doubleShotActive = false;
        this.game.player.brakeBar = 100;
        this.game.player.boostBar = 100;
        this.game.player.rollActive = false;
        this.game.player.rollCooldown = 0;
        this.game.player.rollAngle = 0;
        this.game.gameOver = false; // Reset after cleanup

        // Reset player position and rotation
        this.game.player.group.position.set(0, 0, -5);
        this.game.player.group.rotation.set(0, 0, 0);

        // Reset player rotation variables
        this.game.player.currentPitch = 0;
        this.game.player.currentYaw = 0;
        this.game.player.movementPitch = 0;
        this.game.player.movementRoll = 0;
        this.game.player.targetMovementPitch = 0;
        this.game.player.targetMovementRoll = 0;

        // Clean up scene objects
        this.destroyAllObjects();

        // Update UI
        this.game.ui.update(this.game.player, null);
    }

    destroyAllObjects() {
        // Remove player projectiles
        this.game.player.projectiles.forEach(projectile => {
            this.game.scene.remove(projectile.mesh);
            if (projectile.mesh.geometry) projectile.mesh.geometry.dispose();
            if (projectile.mesh.material) projectile.mesh.material.dispose();
        });
        this.game.player.projectiles.length = 0;

        // Remove enemy projectiles
        this.game.enemyProjectiles.forEach(projectile => {
            this.game.scene.remove(projectile.mesh);
            if (projectile.mesh.geometry) projectile.mesh.geometry.dispose();
            if (projectile.mesh.material) projectile.mesh.material.dispose();
        });
        this.game.enemyProjectiles.length = 0;

        // Remove enemies
        console.log('Enemies before cleanup:', this.game.enemies.length);
        this.game.enemies.forEach(enemy => {
            this.game.scene.remove(enemy.group);
            // if (enemy.group.parent) {
            //     enemy.group.parent.remove(enemy.group); // Ensure removal from the scene
            // }
            // enemy.group.traverse(obj => {
            //     if (obj.isMesh) {
            //         obj.geometry.dispose();
            //         obj.material.dispose();
            //     }
            // });
        });
        this.game.enemies.length = 0;
        console.log('Enemies after cleanup:', this.game.enemies.length);

        // Remove power-ups
        this.game.powerUps.forEach(powerUp => {
            this.game.scene.remove(powerUp.mesh);
            if (powerUp.mesh.geometry) powerUp.mesh.geometry.dispose();
            if (powerUp.mesh.material) powerUp.mesh.material.dispose();
        });
        this.game.powerUps.length = 0;

        // Remove boss if present
        if (this.game.boss) {
            this.game.scene.remove(this.game.boss.group);
            this.game.boss.group.traverse(obj => {
                if (obj.isMesh) {
                    obj.geometry.dispose();
                    obj.material.dispose();
                }
            });
            this.game.boss = null;
            this.game.bossSpawned = false;
        }

        // Remove environment objects
        this.game.environment.billboards.forEach(billboard => {
            this.game.scene.remove(billboard);
            billboard.traverse(obj => {
                if (obj.isMesh) {
                    obj.geometry.dispose();
                    obj.material.dispose();
                }
            });
        });
        this.game.environment.billboards.length = 0;

        this.game.environment.sideShips.forEach(ship => {
            this.game.scene.remove(ship);
            ship.traverse(obj => {
                if (obj.isMesh) {
                    obj.geometry.dispose();
                    obj.material.dispose();
                }
            });
        });
        this.game.environment.sideShips.length = 0;

        console.log('Scene children after cleanup:', this.game.scene.children);
        this.game.scene.children.forEach((child, index) => {
            console.log(`Child ${index}:`, {
                name: child.name || 'Unnamed',
                type: child.type,
                id: child.id,
                parent: child.parent ? child.parent.type : 'None'
            });
        });
        
    
    
    
    }
}

export default RestartGame;
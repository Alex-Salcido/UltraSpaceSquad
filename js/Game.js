// js/Game.js
import Player from './Player.js';
import Controller from './Controller.js';
import Map from './Map.js';
import Environment from './Environment.js';
import UI from './UI.js';
import Enemy from './Enemy.js';
import Projectile from './Projectile.js';
import Powerup from './Powerup.js';
import Boss from './Boss.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.player = new Player(this.scene);
        this.controller = new Controller(this.player, this.camera);   
        
        

        this.map = new Map(this.scene);
        this.environment = new Environment(this.scene);
        this.ui = new UI();

        this.enemies = [];
        this.projectiles = [];
        this.powerUps = [];
        this.boss = null;
        this.explosionParticles = []; // Dedicated array for explosion particles

        this.trackPosition = 0;
        this.baseTrackSpeed = 0.1;
        this.currentTrackSpeed = this.baseTrackSpeed;
        this.trackLength = 1000;

        this.gameOver = false;
        this.bossSpawned = false;
        this.bossLevelDefeated = false;
        this.enemyProjectiles = [];

        this.shakeIntensity = 0;
        this.shakeTimer = 0;

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    start() {
        this.ui.showGameUI();
        this.animate();
    }

    despawnEnemiesOutOfBounds() {
        let i = this.enemies.length;
        while (i--) {
            const enemy = this.enemies[i];
            if (
                enemy.group.position.z > this.player.group.position.z + 10 ||
                Math.abs(enemy.group.position.x - this.player.group.position.x) > 20 ||
                Math.abs(enemy.group.position.y - this.player.group.position.y) > 20
            ) {
                this.scene.remove(enemy.group);
                // // Dispose of each enemy's geometry and materials
                // enemy.group.traverse(obj => {
                //     if (obj.isMesh) {
                //         obj.geometry.dispose();
                //         obj.material.dispose();
                //     }
                // });
                this.enemies.splice(i, 1);
            }
        }
    }

    triggerCameraShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    applyCameraShake(){
        if (this.shakeTimer > 0) {
            this.shakeTimer -= 1 / 60;
            const shakeOffset = new THREE.Vector3(
                (Math.random() - 0.5) * this.shakeIntensity,
                (Math.random() - 0.5) * this.shakeIntensity,
                (Math.random() - 0.5) * this.shakeIntensity
            );
            this.camera.position.add(shakeOffset);
        } else {
            this.shakeIntensity = 0;
        }
    }


    animate() {
        if (this.gameOver) return;
        requestAnimationFrame(() => this.animate());

        // Calculate target camera position
        const distanceFromCenter = Math.max(Math.abs(this.player.group.position.x), Math.abs(this.player.group.position.y));
        let targetCameraPos = new THREE.Vector3(0, 2, this.player.group.position.z + 5);

        if (distanceFromCenter < 5) {
            targetCameraPos.set(0, 2, this.player.group.position.z + 5);
        } else if (distanceFromCenter >= 5 && distanceFromCenter <= 9) {
            targetCameraPos.set(
                this.player.group.position.x * 0.2,
                this.player.group.position.y * 0.2 + 2,
                this.player.group.position.z + 5
            );
        } else {
            const offsetFactor = 0.4;
            targetCameraPos.set(
                this.player.group.position.x * offsetFactor,
                this.player.group.position.y * offsetFactor + 2,
                this.player.group.position.z + 5
            );
        }

        // Smoothly move camera
        this.camera.position.lerp(targetCameraPos, 0.1);
        this.camera.lookAt(this.camera.position.x, this.camera.position.y, this.camera.position.z - 100);

        // Speed adjustment
        if (this.player.isBoosting || this.player.rollActive) {
            this.currentTrackSpeed = this.baseTrackSpeed * 2; // Boost
        } else if (this.controller.isBraking && this.player.brakeBar > 0) {
            this.currentTrackSpeed = this.baseTrackSpeed * 0.5; // Brake
        } else {
            this.currentTrackSpeed = this.baseTrackSpeed; // Normal
        }

        // Update track position
        this.trackPosition += this.currentTrackSpeed;
        
        // Update player (lateral movement handled in Player.js)
        this.player.update(this.controller, this.trackPosition);

        this.map.update(this.trackPosition);
        this.environment.update(this.trackPosition, this.player.group.position.z);
        this.controller.updateCrosshair();

        // Spawn enemies
        if (this.enemies.length < 10 && Math.random() < 0.02 && this.trackPosition < this.trackLength - 100) {
            const type = Math.random();
            const enemyType = type < 0.2 ? 'purple' : type < 0.4 ? 'green' : type < 0.6 ? 'pink' : type < 0.8 ? 'orange' : type < 0.9 ? 'cyan' : 'default';
            const enemy = new Enemy(this.scene, enemyType, this.trackPosition, this.enemyProjectiles);
            this.enemies.push(enemy);
        }

        // Spawn power-ups
        if (Math.random() < 0.005 && this.trackPosition < this.trackLength - 100) {
            const type = Math.random() < 0.5 ? 'extraLife' : 'doubleShot';
            const powerUp = new Powerup(this.scene, type, this.trackPosition);
            this.powerUps.push(powerUp);
        }

        // Spawn boss
        if (this.trackPosition >= this.trackLength - 100 && !this.bossSpawned && this.player.lives > 0 && !this.bossLevelDefeated) {

        // if (this.trackPosition >= this.trackLength - 100 && !this.bossSpawned && this.player.lives > 0 && !this.bossLevelDefeated) {
            this.boss = new Boss(this.scene, this.trackPosition, this.enemyProjectiles);
            this.bossSpawned = true;
        }

        this.enemies.forEach(enemy => enemy.update(this.player, this.trackPosition));
        this.powerUps.forEach(powerUp => powerUp.update(this.player, this.ui));
        if (this.boss) this.boss.update(this.player, this.trackPosition);

            // Update player projectiles
        for (let i = this.player.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.player.projectiles[i];
            projectile.update();
            // Remove projectiles that go too far behind
            if (projectile.mesh.position.z < -this.trackPosition - 50) {
                this.scene.remove(projectile.mesh);
                this.player.projectiles.splice(i, 1);
            }
        }

        // Update enemy projectiles
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.enemyProjectiles[i];
            projectile.update();
            // Remove projectiles that go beyond the track
            if (projectile.mesh.position.z > -this.trackPosition + 50) {
                this.scene.remove(projectile.mesh);
                this.enemyProjectiles.splice(i, 1);
            }
        }
        
        this.checkCollisions();
        this.ui.update(this.player, this.boss);
        this.applyCameraShake()

        this.despawnEnemiesOutOfBounds()

        this.renderer.render(this.scene, this.camera);
    }

    checkCollisions() {
        // Player projectiles vs. enemies
        for (let pIndex = this.player.projectiles.length - 1; pIndex >= 0; pIndex--) {
            const projectile = this.player.projectiles[pIndex];
            for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
                const enemy = this.enemies[eIndex];
                const distance = projectile.mesh.position.distanceTo(enemy.group.position);
                if (distance < 3) {
                    enemy.health -= 1;
                    this.triggerCameraShake(0.1, 0.2);
                    if (enemy.health <= 0) {
                        this.scene.remove(enemy.group);
                        this.enemies.splice(eIndex, 1);
                        this.player.score += 10;
                    }
                    this.scene.remove(projectile.mesh);
                    this.player.projectiles.splice(pIndex, 1);
                    break; // Projectile consumed
                }
            }
        }

        // Player projectiles vs. boss
        if (this.boss) {
            for (let pIndex = this.player.projectiles.length - 1; pIndex >= 0; pIndex--) {
                const projectile = this.player.projectiles[pIndex];
                const distanceToBoss = projectile.mesh.position.distanceTo(this.boss.group.position);
                if (distanceToBoss < 3) {
                    const result = this.boss.takeDamage();
                    this.triggerCameraShake(0.1, 0.2);
                    if (result) { // If boss is defeated, result is the explosion particles
                        this.projectiles.push(...result); // Add explosion particles
                        this.player.score += 100;
                        this.boss = null;// Add game over or level complete logic here if desired
                        setTimeout(() => {
                            this.ui.gameOverMenu.style.display = 'flex';
                            this.ui.gameOverMenu.querySelector('h2').textContent = "Level Completed!";
                            this.ui.gameOverMenu.querySelector('#finalScore').textContent = this.player.score;
                            if (this.player.score > (localStorage.getItem('highScore') || 0)) {
                                localStorage.setItem('highScore', this.player.score);
                                localStorage.setItem('highScoreName', 'Player'); // Replace with player name if implemented
                            }
                        }, 2000);
                    }
                    this.scene.remove(projectile.mesh);
                    this.player.projectiles.splice(pIndex, 1);
                }
            }
        }

        // Enemy projectiles vs. player
        if (this.player.invincibilityTimer <= 0) {
            for (let pIndex = this.enemyProjectiles.length - 1; pIndex >= 0; pIndex--) {
                const projectile = this.enemyProjectiles[pIndex];
                const distance = projectile.mesh.position.distanceTo(this.player.group.position);
                if (distance < 1) {
                    this.player.lives -= 1;
                    this.triggerCameraShake(0.3, 0.5);
                    this.player.invincibilityTimer = 3;
                    this.player.doubleShotActive = false;
                    this.scene.remove(projectile.mesh);
                    this.enemyProjectiles.splice(pIndex, 1);
                    if (this.player.lives <= 0) {
                        this.gameOver = true;
                        this.ui.gameOverMenu.style.display = 'flex';
                        this.ui.gameOverMenu.querySelector('#finalScore').textContent = this.player.score;
                    }
                }
            }
        }

        // Player vs. ground
        if (this.player.group.position.y < -14 && this.player.invincibilityTimer <= 0) {
            this.player.lives -= 1;
            this.triggerCameraShake(0.3, 0.5);
            this.player.invincibilityTimer = 3;
            this.player.doubleShotActive = false;
            this.player.group.position.y = -14;
            if (this.player.lives <= 0) {
                this.gameOver = true;
                this.ui.gameOverMenu.style.display = 'flex';
                this.ui.gameOverMenu.querySelector('#finalScore').textContent = this.player.score;
            }
        }

        // Player vs. enemies
        if (this.player.invincibilityTimer <= 0) {
            for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
                const enemy = this.enemies[eIndex];
                const distance = this.player.group.position.distanceTo(enemy.group.position);
                if (distance < 1) {
                    this.player.lives -= 1;
                    this.triggerCameraShake(0.3, 0.5);
                    this.player.invincibilityTimer = 3;
                    this.player.doubleShotActive = false;
                    this.scene.remove(enemy.group);
                    this.enemies.splice(eIndex, 1);
                    if (this.player.lives <= 0) {
                        this.gameOver = true;
                        this.ui.gameOverMenu.style.display = 'flex';
                        this.ui.gameOverMenu.querySelector('#finalScore').textContent = this.player.score;
                    }
                }
            }
        }
    }
}

export default Game;
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

        this.trackPosition = 0;
        this.baseTrackSpeed = 0.1;
        this.currentTrackSpeed = this.baseTrackSpeed;
        this.trackLength = 1000;

        this.gameOver = false;
        this.bossSpawned = false;
        this.enemyProjectiles = [];
        this.debugMode = false; // Debug mode flag

        // Event listener for toggling debug mode
        window.addEventListener('keydown', (event) => {
            if (event.key === '9') {
                this.debugMode = !this.debugMode;
                console.log('Debug Mode:', this.debugMode ? 'ON (Free Flight)' : 'OFF (Track Mode)');
            }
        });

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

    animate() {
        if (this.gameOver) return;
        requestAnimationFrame(() => this.animate());

        // Camera follows player in both modes
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

        this.camera.position.lerp(targetCameraPos, 0.1);
        this.camera.lookAt(this.player.group.position); // Look directly at player

        // Speed adjustment and track position
        if (!this.debugMode) {
            // Normal track mode
            if (this.player.isBoosting || this.player.rollActive) {
                this.currentTrackSpeed = this.baseTrackSpeed * 2; // Boost
            } else if (this.controller.isBraking && this.player.brakeBar > 0) {
                this.currentTrackSpeed = this.baseTrackSpeed * 0.5; // Brake
            } else {
                this.currentTrackSpeed = this.baseTrackSpeed; // Normal
            }
            this.trackPosition += this.currentTrackSpeed;
        } else {
            // Debug mode: Free flight
            const moveSpeed = this.player.isBoosting ? 0.8 : 0.4; // Faster with boost
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

            if (this.controller.keys.w) {
                this.player.group.position.add(forward.multiplyScalar(moveSpeed));
            }
            if (this.controller.keys.s) {
                this.player.group.position.sub(forward.multiplyScalar(moveSpeed));
            }
            if (this.controller.keys.a) {
                this.player.group.position.sub(right.multiplyScalar(moveSpeed));
            }
            if (this.controller.keys.d) {
                this.player.group.position.add(right.multiplyScalar(moveSpeed));
            }
            if (this.controller.keys.space) {
                this.player.group.position.y += moveSpeed; // Up
            }
            if (this.controller.keys.shift) {
                this.player.group.position.y -= moveSpeed; // Down
            }
        }

        // Update player (pass debugMode flag)
        this.player.update(this.controller, this.trackPosition, this.debugMode);

        this.map.update(this.trackPosition);
        this.environment.update(this.trackPosition);
        this.controller.updateCrosshair();

        // Spawn enemies
        if (!this.debugMode && this.enemies.length < 10 && Math.random() < 0.02 && this.trackPosition < this.trackLength - 100) {
            const type = Math.random();
            const enemyType = type < 0.2 ? 'purple' : type < 0.4 ? 'green' : type < 0.6 ? 'pink' : type < 0.8 ? 'orange' : type < 0.9 ? 'cyan' : 'default';
            const enemy = new Enemy(this.scene, enemyType, this.trackPosition, this.enemyProjectiles);
            this.enemies.push(enemy);
        }

        // Spawn power-ups
        if (!this.debugMode && Math.random() < 0.005 && this.trackPosition < this.trackLength - 100) {
            const type = Math.random() < 0.5 ? 'extraLife' : 'doubleShot';
            const powerUp = new Powerup(this.scene, type, this.trackPosition);
            this.powerUps.push(powerUp);
        }

        // Spawn boss
        if (!this.debugMode && this.trackPosition >= this.trackLength - 100 && !this.bossSpawned && this.player.lives > 0) {
            this.boss = new Boss(this.scene, this.trackPosition);
            this.bossSpawned = true;
        }

        this.enemies.forEach(enemy => enemy.update(this.player, this.trackPosition));
        this.projectiles.forEach(projectile => projectile.update());
        this.powerUps.forEach(powerUp => powerUp.update(this.player));
        if (this.boss) this.boss.update(this.player, this.trackPosition);

        for (let i = this.player.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.player.projectiles[i];
            projectile.update();
            if (projectile.mesh.position.z < -this.trackPosition - 50) {
                this.scene.remove(projectile.mesh);
                this.player.projectiles.splice(i, 1);
            }
        }

        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.enemyProjectiles[i];
            projectile.update();
            if (projectile.mesh.position.z > -this.trackPosition + 50) {
                this.scene.remove(projectile.mesh);
                this.enemyProjectiles.splice(i, 1);
            }
        }
        
        this.checkCollisions();
        this.ui.update(this.player, this.boss);

        this.renderer.render(this.scene, this.camera);
    }

    checkCollisions() {
        // Placeholder for collision logic
    }
}

export default Game;
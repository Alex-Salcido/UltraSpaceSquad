// js/Enemy.js
// import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.js';
import Projectile from './Projectile.js'; // Add this import

class Enemy {
    constructor(scene, type, trackPosition, enemyProjectiles) {
        this.scene = scene; // Needed to add projectiles to the scene
        this.type = type;
        this.enemyProjectiles = enemyProjectiles; // Reference to Game.js's enemyProjectiles array
        this.group = new THREE.Group();

        // Build enemy geometry based on type
        if (type === 'purple') {
            this.group.add(new THREE.Mesh(
                new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16),
                new THREE.MeshBasicMaterial({ color: 0x800080 })
            ));
            const barrel = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.2, 1.5),
                new THREE.MeshBasicMaterial({ color: 0x555555 })
            );
            barrel.position.set(0, 0.4, 0.5);
            this.group.add(barrel);
        } else {
            const color = type === 'green' ? 0x00ff00 :
                         type === 'pink' ? 0xff69b4 :
                         type === 'orange' ? 0xffa500 :
                         type === 'cyan' ? 0x00ffff : 0xff0000;
            this.group.add(new THREE.Mesh(
                new THREE.ConeGeometry(0.4, 1.5, 8),
                new THREE.MeshBasicMaterial({ color })
            ));
            const wingGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.5);
            const leftWing = new THREE.Mesh(
                wingGeometry,
                new THREE.MeshBasicMaterial({ color: 0xaaaaaa })
            );
            const rightWing = new THREE.Mesh(
                wingGeometry,
                new THREE.MeshBasicMaterial({ color: 0xaaaaaa })
            );
            leftWing.position.set(-0.8, 0, 0);
            rightWing.position.set(0.8, 0, 0);
            leftWing.rotation.z = Math.PI / 6;
            rightWing.rotation.z = -Math.PI / 6;
            this.group.add(leftWing, rightWing);
        }

        // Set initial position
        this.group.position.set(
            Math.random() * 20 - 10,
            Math.random() * 20 - 10,
            -trackPosition - 50
        );
        scene.add(this.group);
        this.health = 1;

        // Initialize state for pink enemies
        this.state = type === 'pink' ? 'movingToFront' : null;
    }

    update(player, trackPosition) {
        const enemyPos = this.group.position;

        // AI behavior based on enemy type
        if (this.type === 'purple') {
            // Stationary, occasionally shoot at player
            if (Math.random() < 0.005) {
                this.shootAtPlayer(player);
            }
        } else if (this.type === 'green') {
            // Move toward position 20 units in front of player
            const targetPos = player.group.position.clone();
            targetPos.z -= 20;
            const direction = targetPos.sub(enemyPos).normalize();
            const distance = enemyPos.distanceTo(targetPos);
            if (distance > 1) {
                enemyPos.add(direction.multiplyScalar(0.1));
            }
        } else if (this.type === 'pink') {
            if (this.state === 'movingToFront') {
                // Move forward until reaching 20 units in front of player
                enemyPos.z -= 0.5;
                if (enemyPos.z < player.group.position.z - 20) {
                    this.state = 'inFront';
                    enemyPos.x = Math.random() * 20 - 10;
                    enemyPos.y = Math.random() * 20 - 10;
                }
            } else {
                // Chase player
                const targetPos = player.group.position.clone();
                targetPos.z -= 20;
                const direction = targetPos.sub(enemyPos).normalize();
                const distance = enemyPos.distanceTo(targetPos);
                if (distance > 1) {
                    enemyPos.add(direction.multiplyScalar(0.1));
                }
            }
        } else if (this.type === 'orange') {
            // Move toward position 20 units in front of player, occasionally shoot
            const targetPos = player.group.position.clone();
            targetPos.z -= 20;
            const direction = targetPos.sub(enemyPos).normalize();
            const distance = enemyPos.distanceTo(targetPos);
            if (distance > 1) {
                enemyPos.add(direction.multiplyScalar(0.1));
            }
            if (Math.random() < 0.005) {
                this.shootAtPlayer(player);
            }
        } else if (this.type === 'cyan') {
            // Move directly toward player
            const targetPos = player.group.position.clone();
            const direction = targetPos.sub(enemyPos).normalize();
            const distance = enemyPos.distanceTo(targetPos);
            if (distance > 1) {
                enemyPos.add(direction.multiplyScalar(0.05));
            }
        } else {
            // Default: Stationary, occasionally shoot straight
            if (Math.random() < 0.01) {
                this.shootStraight();
            }
        }



        
    }

    shootAtPlayer(player) {
        const position = this.group.position.clone();
        const direction = player.group.position.clone().sub(this.group.position).normalize();
        const speed = 0.3;
        const color = 0xffff00; // Yellow
        const projectile = new Projectile(this.scene, position, direction, speed, color);
        this.enemyProjectiles.push(projectile);
    }

    shootStraight() {
        const position = this.group.position.clone();
        const direction = new THREE.Vector3(0, 0, 1); // Positive z-axis
        const speed = 0.3;
        const color = 0xffff00; // Yellow
        const projectile = new Projectile(this.scene, position, direction, speed, color);
        this.enemyProjectiles.push(projectile);
    }
}

export default Enemy;
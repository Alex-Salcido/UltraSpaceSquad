// js/Boss.js
// import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.js';
import Projectile from './Projectile.js'; // Add this import

class Boss {
    constructor(scene, trackPosition, enemyProjectiles) {
        this.scene = scene;
        this.enemyProjectiles = enemyProjectiles; // Store reference to add projectiles
        this.group = new THREE.Group();
        this.body = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 2), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
        this.group.add(this.body);
        const armGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
        const leftArm = new THREE.Mesh(armGeometry, new THREE.MeshBasicMaterial({ color: 0x666666 }));
        const rightArm = new THREE.Mesh(armGeometry, new THREE.MeshBasicMaterial({ color: 0x666666 }));
        leftArm.position.set(-2, 0, 0);
        rightArm.position.set(2, 0, 0);
        leftArm.rotation.z = Math.PI / 4;
        rightArm.rotation.z = -Math.PI / 4;
        this.group.add(leftArm, rightArm);
        const head = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshBasicMaterial({ color: 0x333333 }));
        head.position.set(0, 2.5, 0);
        this.group.add(head);
        this.group.position.set(0, 0, -trackPosition - 20);
        scene.add(this.group);

        this.health = 50;
        this.maxHealth = 50;
        this.hitTimer = 0;
        this.hitCount = 0;
        this.originalColor = 0x0000ff;
        this.hitColor = 0xff0000;

        // Health bar setup
        this.healthBar = document.createElement('div');
        this.healthBar.id = 'bossHealthBar';
        this.healthBar.style.position = 'absolute';
        this.healthBar.style.top = '10px';
        this.healthBar.style.left = '50%';
        this.healthBar.style.transform = 'translateX(-50%)';
        this.healthBar.style.width = '600px';
        this.healthBar.style.height = '20px';
        this.healthBar.style.background = '#333';
        this.healthBar.style.border = '1px solid #fff';
        this.healthBarFill = document.createElement('div');
        this.healthBarFill.style.height = '100%';
        this.healthBarFill.style.background = 'red';
        this.healthBar.appendChild(this.healthBarFill);
        document.body.appendChild(this.healthBar);

        // Initial health bar update
        this.updateHealthBar();
    }

    update(player, trackPosition, delta) {
        this.group.position.z = player.group.position.z - 20;
        this.group.position.x = Math.sin(trackPosition * 0.1) * 5;
        this.group.position.y = Math.sin(trackPosition * 0.5) * 3;
        if (this.hitTimer > 0) {
            this.hitTimer -= delta || 1 / 60;
            if (this.hitTimer <= 0) {
                this.hitCount++;
                if (this.hitCount < 2) {
                    this.body.material.color.setHex(this.body.material.color.getHex() === this.originalColor ? this.hitColor : this.originalColor);
                    this.hitTimer = 0.5;
                } else {
                    this.body.material.color.setHex(this.originalColor);
                    this.hitCount = 0;
                }
            }
        }
        
        // Boss shoots at player (5% chance per frame, like index.html)
        if (Math.random() < 0.05) {
            this.shoot(player);
        }

        this.updateHealthBar();
    }

    updateHealthBar() {
        if (this.healthBarFill) {
            this.healthBarFill.style.width = `${(this.health / this.maxHealth) * 100}%`;
        }
    }

    shoot(player) {
        const position = this.group.position.clone();
        const direction = player.group.position.clone().sub(position).normalize();
        
        const speed = 0.3;
        const color = 0xffff00; // Yellow
        
        const projectile = new Projectile(this.scene, position, direction, speed, color);
        
        // this.scene.add(projectile);
        this.enemyProjectiles.push(projectile);
    }

    takeDamage() {
        this.health -= 1;
        this.hitTimer = 0.5;
        this.hitCount = 0;
        this.body.material.color.setHex(this.hitColor);
        this.updateHealthBar();
        if (this.health <= 0) {
            return this.destroy(); // Return explosion particles
        }
        return false;
    }

    explode() {
        const particles = [];
        for (let i = 0; i < 20; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xff0000 })
            );
            particle.position.copy(this.group.position);
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize().multiplyScalar(Math.random() * 2);
            particle.userData.velocity = velocity;
            this.scene.add(particle);
            particles.push(particle);
        }
        // Note: No sound here since bossDestroySound isn't modular yet
        return particles; // Return particles for Game.js to manage
    }

    destroy() {
        const explosionParticles = this.explode(); // Get particles
        this.scene.remove(this.group);
        if (this.healthBar) {
            document.body.removeChild(this.healthBar);
            this.healthBar = null; // Clear reference
            this.healthBarFill = null;
        }
        return explosionParticles; // Pass particles back to Game.js
    }




}

export default Boss;
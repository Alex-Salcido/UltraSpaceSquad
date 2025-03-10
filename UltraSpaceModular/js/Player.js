// js/Player.js
import Projectile from './Projectile.js';

const maxAngleNormal = Math.PI / 4; // 45 degrees
const maxAngleQuick = Math.PI / 2;  // 90 degrees

class Player {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        const mainBody = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2, 3), new THREE.MeshBasicMaterial({ color: 0xaaaaaa }));
        mainBody.rotation.x = -Math.PI / 2;
        this.group.add(mainBody);
        const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
        const wingMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-1.5, 0, 0);
        rightWing.position.set(1.5, 0, 0);
        leftWing.rotation.z = Math.PI / 4;
        rightWing.rotation.z = -Math.PI / 4;
        this.group.add(leftWing, rightWing);
        const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.5), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
        cockpit.position.set(0, 0.3, -0.5);
        this.group.add(cockpit);
        // scene.add(this.group);
        this.group.position.z = -5;


        // Add flying trails for barrel roll
        const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
        const trailGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 2)]);
        this.leftTrail = new THREE.Line(trailGeometry, trailMaterial);
        this.rightTrail = new THREE.Line(trailGeometry, trailMaterial);
        this.leftTrail.position.set(-1.5, 0, 0);
        this.rightTrail.position.set(1.5, 0, 0);
        this.leftTrail.visible = false;
        this.rightTrail.visible = false;
        this.group.add(this.leftTrail, this.rightTrail);

        this.lives = 3;
        this.score = 0;
        this.doubleShotActive = false;
        this.invincibilityTimer = 0;

        // Boost variables
        this.boostBar = 100; // 0-100 scale
        this.boostRegenDelay = 0;
        this.isBoosting = false;

        // Barrel roll variables
        this.rollActive = false;
        this.rollCooldown = 0;
        this.rollAngle = 0;
        this.rollDirection = 1;
        this.rollPitch = 0;
        this.rollYaw = 0;
        this.movementPitch = 0;
        this.movementRoll = 0;
        this.targetMovementPitch = 0;
        this.targetMovementRoll = 0;
        this.currentPitch = 0;
        this.currentYaw = 0;

        this.scene.add(this.group);
        this.projectiles = [];

        //breakBar
        this.brakeBar = 100; // Brake resource starts full
        this.brakeRegenDelay = 0; // Delay before regeneration
    }

    update(controller, trackPosition, debugMode = false) {
    // Set z-position based on trackPosition
        // console.log('Controller keys:', controller.keys); // Debug log to see all keys
        // console.log('W pressed:', controller.keys.w); // Specific key check
        if (!debugMode) {
            this.group.position.z = -trackPosition; // Only set z in normal mode
        }
        // Lateral movement speeds
        const normalSpeed = 0.2; // For A, D, W, S
        const quickSpeed = 0.4;  // For Q, E


        // Brake logic
        if (controller.isBraking && this.brakeBar > 0) {
            this.brakeBar = Math.max(0, this.brakeBar - 1); // Deplete brake bar
            this.brakeRegenDelay = this.brakeBar === 0 ? 2 : 0; // Set 2s delay if depleted
        } else if (!controller.isBraking) {
            if (this.brakeRegenDelay > 0) {
                this.brakeRegenDelay -= 1 / 60; // Decrease delay (assuming 60 FPS)
            } else {
                this.brakeBar = Math.min(100, this.brakeBar + 0.5); // Regenerate brake bar
            }
        }

        // X-axis movement
        if (!debugMode){

        
        if (controller.keys.q && this.group.position.x > -20) {
            this.group.position.x -= quickSpeed;
        } else if (controller.keys.a && this.group.position.x > -20) {
            this.group.position.x -= normalSpeed;
        }
        if (controller.keys.e && this.group.position.x < 20) {
            this.group.position.x += quickSpeed;
        } else if (controller.keys.d && this.group.position.x < 20) {
            this.group.position.x += normalSpeed;
        }

        // Y-axis movement
        if (controller.keys.w && this.group.position.y < 20) {
            this.group.position.y += normalSpeed;
        }
        if (controller.keys.s && this.group.position.y > -20) {
            this.group.position.y -= normalSpeed;
        }

        }

        // Update target movement pitch and roll
        this.targetMovementPitch = 0;
        this.targetMovementRoll = 0;

        if (controller.keys.w) {
            this.targetMovementPitch = maxAngleNormal;
        } else if (controller.keys.s) {
            this.targetMovementPitch = -maxAngleNormal;
        }

        if (controller.keys.q) {
            this.targetMovementRoll = maxAngleQuick;
        } else if (controller.keys.e) {
            this.targetMovementRoll = -maxAngleQuick;
        } else if (controller.keys.a) {
            this.targetMovementRoll = maxAngleNormal;
        } else if (controller.keys.d) {
            this.targetMovementRoll = -maxAngleNormal;
        }

        // Smoothly interpolate movement pitch and roll
        this.movementPitch += (this.targetMovementPitch - this.movementPitch) * 0.1;
        this.movementRoll += (this.targetMovementRoll - this.movementRoll) * 0.1;

// Calculate direction to crosshair
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(controller.mouse, controller.camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -trackPosition - 50);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectPoint);
        const directionToCrosshair = intersectPoint.sub(this.group.position).normalize();

        // Calculate target pitch and yaw
        const targetYaw = Math.atan2(directionToCrosshair.x, directionToCrosshair.z);
        const targetPitch = Math.asin(directionToCrosshair.y);

        // Smoothly interpolate current pitch and yaw
        this.currentPitch += (targetPitch + this.movementPitch - this.currentPitch) * 0.1;
        this.currentYaw += (targetYaw - this.currentYaw) * 0.1;

// Boost logic
        this.isBoosting = controller.keys.space && this.boostBar > 0;
        if (this.isBoosting || this.rollActive) {
            this.boostBar = Math.max(0, this.boostBar - 1); // Deplete boost
            this.boostRegenDelay = this.boostBar === 0 ? 2 : 0; // 2s delay if depleted
            this.leftTrail.visible = true;
            this.rightTrail.visible = true;
        } else {
            this.leftTrail.visible = false;
            this.rightTrail.visible = false;
        }

        if (!controller.keys.space) {
            if (this.boostRegenDelay > 0) {
                this.boostRegenDelay -= 1 / 60;
            } else {
                this.boostBar = Math.min(100, this.boostBar + 0.5); // Regenerate
            }
        }

         // Barrel roll logic
         if (controller.keys.c && !this.rollActive && this.rollCooldown <= 0) {
            this.rollActive = true;
            this.rollAngle = 0;
            this.invincibilityTimer = 2;
            this.rollCooldown = 2;
            this.rollPitch = this.group.rotation.x;
            this.rollYaw = this.group.rotation.y;
            if (controller.keys.a || controller.keys.q) {
                this.rollDirection = 1; // Roll left
            } else if (controller.keys.d || controller.keys.e) {
                this.rollDirection = -1; // Roll right
            } else {
                this.rollDirection = 1; // Default left
            }
            this.leftTrail.visible = true;
            this.rightTrail.visible = true;
        }

        if (this.rollActive) {
            this.rollAngle += 0.3 * this.rollDirection;
            this.group.rotation.z = this.movementRoll + Math.sin(this.rollAngle) * Math.PI;
            this.group.rotation.x = this.rollPitch;
            this.group.rotation.y = this.rollYaw;
            if (Math.abs(this.rollAngle) >= 4 * Math.PI) {
                this.rollActive = false;
                this.rollAngle = 0;
                this.rollDirection = 1;
                this.group.rotation.z = 0; // Reset rotation
                this.leftTrail.visible = false;
                this.rightTrail.visible = false;
            }
} else {
            this.group.rotation.x = this.currentPitch;
            this.group.rotation.y = this.currentYaw;
            this.group.rotation.z = this.movementRoll;
        }

        if (this.rollCooldown > 0) {
            this.rollCooldown -= 1 / 60;
        }

        // Clamp positions to keep player within bounds
        this.group.position.x = Math.max(-20, Math.min(20, this.group.position.x));
        this.group.position.y = Math.max(-20, Math.min(20, this.group.position.y));

        // Invincibility logic
        if (this.invincibilityTimer > 0) {
            this.invincibilityTimer -= 1 / 60;
            this.group.children.forEach(child => child.material.color.setHex(0xffff00));
        } else {
            this.group.children[0].material.color.setHex(0xaaaaaa);
            this.group.children[1].material.color.setHex(0x00ff00);
            this.group.children[2].material.color.setHex(0x00ff00);
            this.group.children[3].material.color.setHex(0x0000ff);
        }

        // Add vibration effect when boosting
        if (this.isBoosting || this.rollActive) {
            const shakeIntensity = 0.05;
            const shakeOffset = new THREE.Vector3(
                (Math.random() - 0.5) * shakeIntensity,
                (Math.random() - 0.5) * shakeIntensity,
                0
            );
            this.group.position.add(shakeOffset);
}
    }

    shoot(direction) {
        const projectile = new Projectile(this.scene, this.group.position, direction, 1.0, this.doubleShotActive ? 0x0000ff : 0xff0000);
        this.projectiles.push(projectile);
        if (this.doubleShotActive) {
            const offsetPos = this.group.position.clone();
            offsetPos.x += 0.5;
            const extraProjectile = new Projectile(this.scene, offsetPos, direction, 1.0, 0x0000ff);
            this.projectiles.push(extraProjectile);
        }
    }
}

export default Player;
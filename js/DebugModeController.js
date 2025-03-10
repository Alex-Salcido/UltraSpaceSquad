// js/DebugModeController.js
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.js';

class DebugModeController {
    constructor(camera) {
        this.camera = camera; // The debug camera
        this.moveSpeed = 0.5; // Speed of camera movement
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            up: false,
            down: false
        };

        // Add event listeners for debug controls
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
        window.addEventListener('keyup', (event) => this.handleKeyUp(event));
    }

    handleKeyDown(event) {
        switch (event.key) {
            case 'w':
                this.keys.w = true;
                break;
            case 'a':
                this.keys.a = true;
                break;
            case 's':
                this.keys.s = true;
                break;
            case 'd':
                this.keys.d = true;
                break;
            case 'ArrowUp':
                this.keys.up = true;
                break;
            case 'ArrowDown':
                this.keys.down = true;
                break;
        }
    }

    handleKeyUp(event) {
        switch (event.key) {
            case 'w':
                this.keys.w = false;
                break;
            case 'a':
                this.keys.a = false;
                break;
            case 's':
                this.keys.s = false;
                break;
            case 'd':
                this.keys.d = false;
                break;
            case 'ArrowUp':
                this.keys.up = false;
                break;
            case 'ArrowDown':
                this.keys.down = false;
                break;
        }
    }

    update() {
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

        if (this.keys.w) {
            this.camera.position.add(forward.multiplyScalar(this.moveSpeed));
        }
        if (this.keys.s) {
            this.camera.position.sub(forward.multiplyScalar(this.moveSpeed));
        }
        if (this.keys.a) {
            this.camera.position.sub(right.multiplyScalar(this.moveSpeed));
        }
        if (this.keys.d) {
            this.camera.position.add(right.multiplyScalar(this.moveSpeed));
        }
        if (this.keys.up) {
            this.camera.position.y += this.moveSpeed;
        }
        if (this.keys.down) {
            this.camera.position.y -= this.moveSpeed;
        }
    }
}

export default DebugModeController;
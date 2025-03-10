// js/Powerup.js
class Powerup {
    constructor(scene, type, trackPosition) {
        this.type = type;
        this.scene = scene;
        if (type === 'extraLife') {
            const heartShape = new THREE.Shape();
            heartShape.moveTo(0, 0);
            heartShape.quadraticCurveTo(0.5, 0.5, 1, 0);
            heartShape.quadraticCurveTo(1.5, -0.5, 0, -1);
            heartShape.quadraticCurveTo(-1.5, -0.5, -1, 0);
            heartShape.quadraticCurveTo(-0.5, 0.5, 0, 0);
            this.mesh = new THREE.Mesh(
                new THREE.ExtrudeGeometry(heartShape, { depth: 0.2, bevelEnabled: false }),
                new THREE.MeshBasicMaterial({ color: 0xff0000 })
            );
        } else {
            this.mesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 1, 3),
                new THREE.MeshBasicMaterial({ color: 0xffd700 })
            );
        }
        this.mesh.position.set(Math.random() * 20 - 10, Math.random() * 20 - 10, -trackPosition - 50);
        scene.add(this.mesh);
        this.collected = false; // Flag to prevent multiple triggers
    }

    update(player, ui) {
        if (this.collected) return; // Skip if already collected
        const distance = this.mesh.position.distanceTo(player.group.position);
        if (distance < 2) {
            if (this.type === 'extraLife') {
                if (player.lives < 6) {
                    player.lives += 1;
                    this.collected = true; // Mark as collected
                    ui.displayPowerUpMessage('Extra Life!');
                } 
            } else if (this.type === 'doubleShot') {
                player.doubleShotActive = true;
                this.collected = true; // Mark as collected
                ui.displayPowerUpMessage('Double Shot!');
            }
            
            this.scene.remove(this.mesh);
        }
    }
}

export default Powerup;
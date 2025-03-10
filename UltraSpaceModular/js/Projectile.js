// js/Projectile.js
class Projectile {
    constructor(scene, position, direction, speed, color) {
        this.scene = scene;
        this.direction = direction.clone().normalize(); // Ensure direction is a unit vector
        this.speed = speed || 1.0; // Default speed if none provided
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshBasicMaterial({ color: color || 0xff0000 })
        );
        this.mesh.position.copy(position);
        this.scene.add(this.mesh);
    }

    update() {
        // Move the projectile forward based on its direction and speed
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed));
    }
}

export default Projectile;
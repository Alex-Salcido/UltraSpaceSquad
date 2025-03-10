// js/Environment.js
import CargoShip from './CargoShip.js';

class Environment {
    constructor(scene) {
        this.scene = scene;
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('assets/textures/starfield.jpg', (texture) => {
            this.scene.background = texture;
        });
        this.billboards = [];
        this.sideShips = [];
        this.lastShipSpawnPosition = 0;
        this.spawnInterval = 100;
    }

    update(trackPosition, playerZ) {
        // if (Math.random() < 0.005 && trackPosition < 900) {
        //     const billboard = new THREE.Mesh(
        //         new THREE.BoxGeometry(10, 6, 0.2),
        //         new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('assets/textures/billboard.png'), side: THREE.DoubleSide })
        //     );
        //     billboard.position.set(Math.random() < 0.5 ? -20 : 20, 5, -trackPosition - 50);
        //     this.scene.add(billboard);
        //     this.billboards.push(billboard);
        // }
        if (trackPosition >= this.lastShipSpawnPosition + this.spawnInterval && trackPosition < 900) {
            const ship = new CargoShip();
            ship.group.position.set(
                Math.random() < 0.5 ? -30 : 30, // Left or right side
                Math.random() * 10 - 5,         // Random Y between -5 and 5
                -trackPosition - 50             // 50 units behind current track position
            );
            this.scene.add(ship.group);
            this.sideShips.push(ship.group); // Store the group for cleanup
            this.lastShipSpawnPosition = Math.floor(trackPosition / this.spawnInterval) * this.spawnInterval;
        }

        // Optional: Update side ships if needed (e.g., movement)
        this.sideShips.forEach(ship => {
            // Could call ship.update() if CargoShip had an update method
        });
        // Despawn logic
        for (let i = this.billboards.length - 1; i >= 0; i--) {
            if (this.billboards[i].position.z > playerZ + 10) {
                this.scene.remove(this.billboards[i]);
                this.billboards.splice(i, 1);
                console.log('BILLBOARD REMOVED')
            }
        }
        for (let i = this.sideShips.length - 1; i >= 0; i--) {
            if (this.sideShips[i].position.z > playerZ + 10) {
                this.scene.remove(this.sideShips[i]);
                this.sideShips.splice(i, 1);
                this.lastShipSpawnPosition = 0; // Reset spawn tracking
            }
        }
    }
}

export default Environment;
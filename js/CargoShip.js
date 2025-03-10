// js/CargoShip.js
// import * as THREE from 'three';

class CargoShip {
    constructor() {
        this.group = this.createCargoShip();
    }

    createCargoShip() {
        const shipGroup = new THREE.Group();

        // Main cargo hold (large rectangular body)
        const cargoHoldGeometry = new THREE.BoxGeometry(4, 2, 8);
        const cargoHoldMaterial = new THREE.MeshBasicMaterial({ color: 0x555555 });
        const cargoHold = new THREE.Mesh(cargoHoldGeometry, cargoHoldMaterial);
        cargoHold.position.set(0, 0, 0);
        shipGroup.add(cargoHold);

        // Cockpit (smaller raised section at the front)
        const cockpitGeometry = new THREE.BoxGeometry(2, 1, 2);
        const cockpitMaterial = new THREE.MeshBasicMaterial({ color: 0x777777 });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.set(0, 1.5, 3);
        shipGroup.add(cockpit);

        // Side containers (two boxes on the sides)
        const containerGeometry = new THREE.BoxGeometry(1, 1, 6);
        const containerMaterial = new THREE.MeshBasicMaterial({ color: 0x3333ff });
        const leftContainer = new THREE.Mesh(containerGeometry, containerMaterial);
        leftContainer.position.set(-2.5, 0, 0);
        shipGroup.add(leftContainer);
        const rightContainer = new THREE.Mesh(containerGeometry, containerMaterial);
        rightContainer.position.set(2.5, 0, 0);
        shipGroup.add(rightContainer);

        // Thrusters (two small cylinders at the back)
        const thrusterGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
        const thrusterMaterial = new THREE.MeshBasicMaterial({ color: 0xff5500 });
        const leftThruster = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
        leftThruster.position.set(-1, 0, -4.5);
        leftThruster.rotation.x = Math.PI / 2;
        shipGroup.add(leftThruster);
        const rightThruster = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
        rightThruster.position.set(1, 0, -4.5);
        rightThruster.rotation.x = Math.PI / 2;
        shipGroup.add(rightThruster);

        // Antenna (thin rod on top)
        const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
        const antennaMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.set(0, 2.5, 0);
        shipGroup.add(antenna);

        return shipGroup;
    }

    // Optional: Add an update method if you want the ship to animate or move later
    update() {
        // Placeholder for future movement or animation logic if needed
    }
}

export default CargoShip;
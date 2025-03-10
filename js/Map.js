// js/Map.js
class Map {
    constructor(scene) {
        this.ground = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 2000),
            new THREE.MeshBasicMaterial({ color: 0x333333 })
        );
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -15;
        scene.add(this.ground);
    }

    update(trackPosition) {
        this.ground.position.z = -trackPosition;
    }
}

export default Map;
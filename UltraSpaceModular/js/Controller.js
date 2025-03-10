class Controller {
    constructor(player, camera) {
        this.player = player;
        this.camera = camera;
        this.keys = { w: false, a: false, s: false, d: false, space: false, q: false, e: false, c: false };
        this.isBraking = false;
        this.aimJoystickActive = false;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.crosshair = document.getElementById('crosshair');
        this.outerCrosshair = document.getElementById('outerCrosshair');
        this.crosshairX = window.innerWidth / 2;
        this.crosshairY = window.innerHeight / 2;
        this.outerCrosshairX = this.crosshairX;
        this.outerCrosshairY = this.crosshairY;
        this.lastShotTime = 0;
        this.shootCooldown = 0.1;

        // Detect if the device is mobile
        this.isMobile = /Mobi|Android/i.test(navigator.userAgent);

        document.addEventListener('contextmenu', (e) => e.preventDefault());

        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (this.keys.hasOwnProperty(key)) {
                this.keys[key] = true;
            }
            if (e.key === ' ') {
                this.keys.space = true;
            }
        });
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (this.keys.hasOwnProperty(key)) {
                this.keys[key] = false;
            }
            if (e.key === ' ') {
                this.keys.space = false;
            }
        });

        // Mouse events (always active for desktop aiming)
        document.addEventListener('mousemove', (e) => {
            if (!this.isMobile) { // Only update crosshair with mouse on non-mobile
                this.crosshairX = e.clientX;
                this.crosshairY = e.clientY;
                this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            }
        });
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0 && !this.aimJoystickActive) {
                // Set raycaster from camera through mouse position
                this.raycaster.setFromCamera(this.mouse, this.camera);
                // Uncomment below to return to the normal aim
                const direction = this.raycaster.ray.direction.clone().normalize();



                
                this.player.shoot(direction);
            } else if (e.button === 2) {
                this.isBraking = true;
            }
        });
        document.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.isBraking = false;
            }
        });

        if (this.isMobile) {
            this.setupJoysticks();
        }
    }

    setupJoysticks() {
        const movementZone = document.getElementById('movementJoystick');
        const aimZone = document.getElementById('aimJoystick');

        this.movementJoystick = nipplejs.create({
            zone: movementZone,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'cyan',
            size: 100
        });

        this.aimJoystick = nipplejs.create({
            zone: aimZone,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'red',
            size: 100
        });

        this.movementJoystick.on('move', (evt, data) => {
            if (data.direction) {
                const angle = data.angle.radian;
                const force = (data.distance / 50) * 0.5;
                this.keys.w = angle > Math.PI / 4 && angle < 3 * Math.PI / 4 && force > 0.2;
                this.keys.s = angle > 5 * Math.PI / 4 && angle < 7 * Math.PI / 4 && force > 0.2;
                this.keys.a = angle > 3 * Math.PI / 4 && angle < 5 * Math.PI / 4 && force > 0.2;
                this.keys.d = (angle > 7 * Math.PI / 4 || angle < Math.PI / 4) && force > 0.2;
            }
        }).on('end', () => {
            this.keys.w = this.keys.a = this.keys.s = this.keys.d = false;
        });

        this.aimJoystick
            .on('start', () => {
                this.aimJoystickActive = true;
            })
            .on('move', (evt, data) => {
                if (data.direction) {
                    const angle = data.angle.radian;
                    const force = (data.distance / 50) * 0.2;
                    if (force > 0) {
                        const currentTime = performance.now() / 1000;
                        if (currentTime - this.lastShotTime < this.shootCooldown) return;

                        // Use ship's forward direction for mobile shooting
                        const direction = new THREE.Vector3(0, 0, -1);
                        direction.applyQuaternion(this.player.group.quaternion).normalize();
                        this.player.shoot(direction);

                        this.lastShotTime = currentTime;
                    }
                }
            })
            .on('end', () => {
                this.aimJoystickActive = false;
            });
    }

    updateCrosshair() {
        if (this.isMobile) {
            // Project crosshair in front of the ship for mobile
            const shipPosition = this.player.group.position.clone();
            const forward = new THREE.Vector3(0, 0, -1); // Assuming negative Z is forward
            forward.applyQuaternion(this.player.group.quaternion);
            const distanceInFront = 10; // Distance in front of the ship
            const crosshairWorldPos = shipPosition.clone().add(forward.multiplyScalar(distanceInFront));

            crosshairWorldPos.project(this.camera);

            this.crosshairX = (crosshairWorldPos.x * 0.5 + 0.5) * window.innerWidth;
            this.crosshairY = (-crosshairWorldPos.y * 0.5 + 0.5) * window.innerHeight;

            this.crosshairX = Math.max(0, Math.min(window.innerWidth, this.crosshairX));
            this.crosshairY = Math.max(0, Math.min(window.innerHeight, this.crosshairY));
        }
        // On desktop, crosshairX and crosshairY are updated via mousemove event

        // Update crosshair and outer crosshair positions
        this.crosshair.style.left = this.crosshairX + 'px';
        this.crosshair.style.top = this.crosshairY + 'px';
        this.outerCrosshairX += (this.crosshairX - this.outerCrosshairX) * 0.3;
        this.outerCrosshairY += (this.crosshairY - this.outerCrosshairY) * 0.4;
        this.outerCrosshair.style.left = this.outerCrosshairX + 'px';
        this.outerCrosshair.style.top = this.outerCrosshairY + 'px';
    }
}

export default Controller;
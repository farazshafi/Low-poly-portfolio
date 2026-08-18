import * as THREE from 'three';

// ─── Tweak camera feel ────────────────────────────────────────────────────────

export const CAM_CONFIG = {
    DISTANCE: 8.0,   // default follow distance (world units)
    MIN_DISTANCE: 1.5,   // closest camera can get (collision pull-in floor)
    HEIGHT_OFFSET: 1.0,   // look-at point lifted above character feet
    PHI_MIN: 0.12,  // minimum vertical angle (radians above horizontal)
    PHI_MAX: 1.30,  // maximum vertical angle (near top-down)
    MOUSE_SENS: 0.004, // horizontal sensitivity
    MOUSE_SENS_V: 0.003, // vertical sensitivity
    POS_LERP: 0.10,  // camera position smoothing (lower = more lag)
    LOOK_LERP: 0.14,  // look-at point smoothing
    COLLISION_MARGIN: 0.4,   // clearance kept from obstacles
};

/**
 * Smooth third-person follow camera with:
 *  - right-click drag orbit (theta = horizontal, phi = vertical)
 *  - collision-aware pull-in (raycasts toward world objects)
 *  - smooth lerp on both position and look-at target
 *
 * Usage:
 *   const tpCam = new ThirdPersonCamera(camera, collidables);
 *   // each frame:
 *   tpCam.update(charBodyPosition, mouseDx, mouseDy);
 *   // movement direction (for WASD-relative-to-camera):
 *   const theta = tpCam.theta;
 */
export class ThirdPersonCamera {
    /**
     * @param {THREE.PerspectiveCamera} camera
     * @param {THREE.Object3D[]}        collidables  meshes / groups to avoid
     */
    constructor(camera, collidables) {
        this.camera = camera;
        this.collidables = collidables;

        // theta: horizontal angle (Math.PI = camera behind character facing +z)
        this.theta = Math.PI;
        // phi: vertical angle (0 = horizon, PI/2 = top-down)
        this.phi = 0.45;

        this._currentPos = camera.position.clone();
        this._currentLookAt = new THREE.Vector3(0, 1, 0);
        this._raycaster = new THREE.Raycaster();
        this._lastDist = CAM_CONFIG.DISTANCE;

        // Reusable vectors to avoid per-frame GC
        this._tmpTarget = new THREE.Vector3();
        this._tmpDir = new THREE.Vector3();
        this._tmpIdeal = new THREE.Vector3();
    }

    /**
     * @param {{ x: number, y: number, z: number }} bodyPos  cannon-es body position
     * @param {number} dx   accumulated mouse delta X (pixels)
     * @param {number} dy   accumulated mouse delta Y (pixels)
     */
    update(bodyPos, dx, dy) {
        const cfg = CAM_CONFIG;

        // ── Update orbit angles ─────────────────────────────────────────────────
        this.theta -= dx * cfg.MOUSE_SENS;
        this.phi = Math.max(cfg.PHI_MIN, Math.min(cfg.PHI_MAX,
            this.phi - dy * cfg.MOUSE_SENS_V));

        // ── Look-at target: character centre ────────────────────────────────────
        this._tmpTarget.set(bodyPos.x, bodyPos.y - 0.9 + cfg.HEIGHT_OFFSET, bodyPos.z);

        // ── Ideal camera position from spherical coords ──────────────────────────
        const cosPhi = Math.cos(this.phi);
        this._tmpDir.set(
            Math.sin(this.theta) * cosPhi,
            Math.sin(this.phi),
            Math.cos(this.theta) * cosPhi,
        );

        // ── Collision raycasting ────────────────────────────────────────────────
        this._raycaster.set(this._tmpTarget, this._tmpDir);
        this._raycaster.near = 0.1;
        this._raycaster.far = cfg.DISTANCE;

        const hits = this._raycaster.intersectObjects(this.collidables, true);
        let actualDist = cfg.DISTANCE;
        if (hits.length > 0) {
            const hitDist = hits[0].distance - cfg.COLLISION_MARGIN;
            actualDist = Math.max(cfg.MIN_DISTANCE, hitDist);
        }

        this._tmpIdeal
            .copy(this._tmpTarget)
            .addScaledVector(this._tmpDir, actualDist);

        // Pull camera in faster than it recovers (prevents wall-clip pop)
        const lerpFactor = actualDist < this._lastDist
            ? Math.min(cfg.POS_LERP * 3.5, 1)
            : cfg.POS_LERP;
        this._lastDist = actualDist;

        // ── Smooth position + look-at ───────────────────────────────────────────
        this._currentPos.lerp(this._tmpIdeal, lerpFactor);
        this._currentLookAt.lerp(this._tmpTarget, cfg.LOOK_LERP);

        this.camera.position.copy(this._currentPos);
        this.camera.lookAt(this._currentLookAt);
    }
}

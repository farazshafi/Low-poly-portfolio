import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { getHeightAt } from '../world/terrain.js';

// ─── Tweak movement feel ──────────────────────────────────────────────────────

export const CONTROLLER_CONFIG = {
    WALK_SPEED: 6.5,   // m/s
    RUN_SPEED: 12.0,  // m/s (Shift held)
    JUMP_VELOCITY: 13.0,  // initial upward velocity
    GRAVITY: -30,   // must match physics world gravity
    SPHERE_RADIUS: 0.9,  // physics sphere size — character center at this height when grounded
    TURN_SPEED: 12,   // radians/sec for character facing lerp
    XZ_DECEL: 0.80, // velocity multiplier each frame when no input
    JUMP_COOLDOWN: 0.25, // seconds before allowed to jump again
    GROUND_TOLERANCE: 0.05, // how far below terrain to allow before snapping up
};

/**
 * Creates a cannon-es sphere body that moves with WASD relative to the camera.
 * Ground is enforced via getHeightAt — no heightfield mesh needed.
 *
 * @param {CANNON.World} physicsWorld
 * @returns {object} controller handle — call update() every frame
 */
export function createController(physicsWorld) {
    const cfg = CONTROLLER_CONFIG;

    // Sphere body — fixedRotation prevents toppling
    const body = new CANNON.Body({
        mass: 70,
        shape: new CANNON.Sphere(cfg.SPHERE_RADIUS),
        linearDamping: 0,
        angularDamping: 1,
        fixedRotation: true,
    });
    body.position.set(0, cfg.SPHERE_RADIUS + getHeightAt(0, 0) + 0.5, 0);
    physicsWorld.addBody(body);

    // Internal state
    let facing = 0;       // character's Y-rotation (radians)
    let isGrounded = false;
    let isMoving = false;
    let jumpCooldown = 0;
    let squashStretch = 1.0;     // scale Y of body: >1 stretch, <1 squash

    /**
     * @param {number}  delta        seconds since last frame
     * @param {object}  keys         from InputManager.keys
     * @param {boolean} jumpPressed  from InputManager.consumeJump()
     * @param {number}  cameraTheta  camera azimuth from ThirdPersonCamera
     */
    function update(delta, keys, jumpPressed, cameraTheta) {
        // ── Step physics world ──────────────────────────────────────────────────
        physicsWorld.step(1 / 60, delta, 3);

        // ── Ground constraint — sample terrain directly ─────────────────────────
        const px = body.position.x;
        const pz = body.position.z;
        const groundY = getHeightAt(px, pz);
        const floorLevel = groundY + cfg.SPHERE_RADIUS;

        if (body.position.y <= floorLevel + cfg.GROUND_TOLERANCE) {
            body.position.y = floorLevel;
            if (body.velocity.y < 0) body.velocity.y = 0;
            isGrounded = true;
        } else {
            isGrounded = false;
        }

        jumpCooldown = Math.max(0, jumpCooldown - delta);

        // ── XZ movement relative to camera heading ──────────────────────────────
        // cameraTheta: camera sits at (sin θ · d, h, cos θ · d) from character
        // → "forward" for player = (-sin θ, 0, -cos θ)
        // → "right"   for player = ( cos θ, 0, -sin θ)
        const sinT = Math.sin(cameraTheta);
        const cosT = Math.cos(cameraTheta);

        let mx = 0, mz = 0;
        if (keys.forward) { mx -= sinT; mz -= cosT; }
        if (keys.back) { mx += sinT; mz += cosT; }
        if (keys.left) { mx -= cosT; mz += sinT; }
        if (keys.right) { mx += cosT; mz -= sinT; }

        const len = Math.sqrt(mx * mx + mz * mz);
        isMoving = len > 0.01;

        if (isMoving) {
            // Normalise and scale to chosen speed
            const speed = keys.sprint ? cfg.RUN_SPEED : cfg.WALK_SPEED;
            const invLen = 1 / len;
            body.velocity.x = mx * invLen * speed;
            body.velocity.z = mz * invLen * speed;

            // Smooth character turn toward movement direction
            const targetFacing = Math.atan2(mx, mz);
            const diff = ((targetFacing - facing + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
            facing += diff * Math.min(cfg.TURN_SPEED * delta, 1);
        } else {
            body.velocity.x *= cfg.XZ_DECEL;
            body.velocity.z *= cfg.XZ_DECEL;
        }

        // ── Jump ────────────────────────────────────────────────────────────────
        if (jumpPressed && isGrounded && jumpCooldown === 0) {
            body.velocity.y = cfg.JUMP_VELOCITY;
            isGrounded = false;
            jumpCooldown = cfg.JUMP_COOLDOWN;
        }

        // ── Squash-stretch target for character.animate() ───────────────────────
        // Ascending: stretch (>1), descending fast: squash (<1), grounded: 1
        let targetStretch = 1.0;
        if (!isGrounded) {
            targetStretch = body.velocity.y > 1 ? 1.30 : body.velocity.y < -4 ? 0.80 : 1.0;
        }
        squashStretch += (targetStretch - squashStretch) * Math.min(10 * delta, 1);
    }

    return {
        body,
        update,
        get isGrounded() { return isGrounded; },
        get isMoving() { return isMoving; },
        get facing() { return facing; },
        get squashStretch() { return squashStretch; },
        get xzSpeed() { return Math.sqrt(body.velocity.x ** 2 + body.velocity.z ** 2); },
    };
}

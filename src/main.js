import * as THREE from 'three';
import * as CANNON from 'cannon-es';

import { createRenderer } from './scene/renderer.js';
import { createCamera } from './scene/camera.js';
import { createLights } from './scene/lights.js';
import { createSky } from './scene/sky.js';
import { createPostProcessing, resizeComposer } from './scene/postprocessing.js';

import { createTerrain } from './world/terrain.js';
import { createMountains } from './world/mountains.js';
import { createTrees } from './world/trees.js';
import { createRocks } from './world/rocks.js';
import { createMist } from './world/mist.js';

import { InputManager } from './player/input.js';
import { createCharacter } from './player/character.js';
import { createController } from './player/controller.js';
import { ThirdPersonCamera } from './player/thirdPersonCamera.js';

// ─── Scene ───────────────────────────────────────────────────────────────────

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xd4895a, 0.007);

// ─── Renderer & camera ────────────────────────────────────────────────────────

const container = document.getElementById('app');
const renderer = createRenderer(container);
const camera = createCamera(container);

// ─── Lighting & sky ───────────────────────────────────────────────────────────

createLights(scene);
createSky(scene);

// ─── World ────────────────────────────────────────────────────────────────────

const terrain = createTerrain(scene);
const mountainGroup = createMountains(scene);
createTrees(scene);
createRocks(scene);

const { update: updateMist } = createMist(scene);

// ─── Physics world ────────────────────────────────────────────────────────────

const physicsWorld = new CANNON.World({
    gravity: new CANNON.Vec3(0, -30, 0),
    broadphase: new CANNON.NaiveBroadphase(),
});
physicsWorld.solver.iterations = 10;

// ─── Player ───────────────────────────────────────────────────────────────────

const input = new InputManager();
const { group: charGroup, animate: animateCharacter } = createCharacter(scene);
const controller = createController(physicsWorld);

// Collidables for camera collision — terrain + mountains
const tpCamera = new ThirdPersonCamera(camera, [terrain, mountainGroup]);

// ─── Post-processing ──────────────────────────────────────────────────────────

const composer = createPostProcessing(renderer, scene, camera);

// ─── Resize handling ──────────────────────────────────────────────────────────

function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    resizeComposer(composer, w, h);
}
window.addEventListener('resize', onResize);

// ─── Animation loop ───────────────────────────────────────────────────────────

const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
    const delta = Math.min(clock.getDelta(), 0.05); // cap at 50 ms to avoid spiral
    const time = clock.elapsedTime;

    // 1. Consume input
    const { dx, dy } = input.consumeMouseDelta();
    const jumped = input.consumeJump();

    // 2. Update camera orbit (provides theta for movement direction)
    tpCamera.update(controller.body.position, dx, dy);

    // 3. Move physics body (steps world internally)
    controller.update(delta, input.keys, jumped, tpCamera.theta);

    // 4. Sync visual character to physics body
    const { x, y, z } = controller.body.position;
    const SPHERE_R = 0.9;  // must match CONTROLLER_CONFIG.SPHERE_RADIUS
    charGroup.position.set(x, y - SPHERE_R, z);
    charGroup.rotation.y = controller.facing;

    // 5. Animate character (bob, swing, squash-stretch)
    animateCharacter({
        isMoving: controller.isMoving,
        isGrounded: controller.isGrounded,
        time,
        delta,
        targetStretch: controller.squashStretch,
    });

    // 6. Mist drift
    updateMist();

    // 7. Render via composer (bloom pass)
    composer.render();
});

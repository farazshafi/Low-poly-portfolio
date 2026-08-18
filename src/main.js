import * as THREE from 'three';
import { createRenderer } from './scene/renderer.js';
import { createCamera } from './scene/camera.js';
import { createLights } from './scene/lights.js';
import { createControls } from './scene/controls.js';
import { createSky } from './scene/sky.js';
import { createPostProcessing, resizeComposer } from './scene/postprocessing.js';
import { createGround } from './world/ground.js';
import { createMist } from './world/mist.js';

// ─── Scene ───────────────────────────────────────────────────────────────────

const scene = new THREE.Scene();

// No scene.background needed — the sky dome covers it.
// Warm dusty-gold exponential fog fades distant objects atmospherically.
scene.fog = new THREE.FogExp2(0xd4895a, 0.007);

// ─── Core objects ─────────────────────────────────────────────────────────────

const container = document.getElementById('app');

const renderer = createRenderer(container);
const camera = createCamera(container);
const controls = createControls(camera, renderer.domElement);

createLights(scene);
createSky(scene);
createGround(scene);

const { update: updateMist } = createMist(scene);

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

renderer.setAnimationLoop((_time) => {
    controls.update();   // damping
    updateMist();        // drift particles

    // Use composer instead of renderer.render so bloom is applied
    composer.render();
});

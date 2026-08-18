import * as THREE from 'three';
import { createRenderer } from './scene/renderer.js';
import { createCamera } from './scene/camera.js';
import { createLights } from './scene/lights.js';
import { createControls } from './scene/controls.js';
import { createGround } from './world/ground.js';

// ─── Scene ───────────────────────────────────────────────────────────────────

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7ab3d0); // sky blue
scene.fog = new THREE.Fog(0x7ab3d0, 80, 200);  // atmospheric depth

// ─── Core objects ─────────────────────────────────────────────────────────────

const container = document.getElementById('app');

const renderer = createRenderer(container);
const camera = createCamera(container);
const controls = createControls(camera, renderer.domElement);

createLights(scene);
createGround(scene);

// ─── Resize handling ──────────────────────────────────────────────────────────

function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', onResize);

// ─── Animation loop ───────────────────────────────────────────────────────────

renderer.setAnimationLoop((_time) => {
    controls.update(); // required for damping
    renderer.render(scene, camera);
});

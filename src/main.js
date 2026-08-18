import * as THREE from 'three';
import { createRenderer } from './scene/renderer.js';
import { createCamera } from './scene/camera.js';
import { createLights } from './scene/lights.js';
import { createControls } from './scene/controls.js';
import { createSky } from './scene/sky.js';
import { createPostProcessing, resizeComposer } from './scene/postprocessing.js';
import { createTerrain } from './world/terrain.js';
import { createMountains } from './world/mountains.js';
import { createTrees } from './world/trees.js';
import { createRocks } from './world/rocks.js';
import { createMist } from './world/mist.js';

// ─── Scene ───────────────────────────────────────────────────────────────────

const scene = new THREE.Scene();

// Warm dusty-gold exponential fog fades distant mountains atmospherically
scene.fog = new THREE.FogExp2(0xd4895a, 0.007);

// ─── Core objects ─────────────────────────────────────────────────────────────

const container = document.getElementById('app');

const renderer = createRenderer(container);
const camera = createCamera(container);
const controls = createControls(camera, renderer.domElement);

createLights(scene);
createSky(scene);

// ─── World ────────────────────────────────────────────────────────────────────

createTerrain(scene);
createMountains(scene);
createTrees(scene);
createRocks(scene);

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
    controls.update();
    updateMist();
    composer.render();
});

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Attaches OrbitControls to the camera.
 * Temporary — will be replaced by a third-person follow camera.
 * @param {THREE.PerspectiveCamera} camera
 * @param {HTMLCanvasElement} canvas
 * @returns {OrbitControls}
 */
export function createControls(camera, canvas) {
    const controls = new OrbitControls(camera, canvas);

    controls.enableDamping = true;        // smooth inertia
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = false;  // pan in world-XZ plane
    controls.minDistance = 3;
    controls.maxDistance = 120;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // prevent clipping below ground

    controls.target.set(0, 0, 0);
    controls.update();

    return controls;
}

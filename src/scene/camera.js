import * as THREE from 'three';

/**
 * Creates a PerspectiveCamera sized to the given container.
 * @param {HTMLElement} container
 * @returns {THREE.PerspectiveCamera}
 */
export function createCamera(container) {
    const camera = new THREE.PerspectiveCamera(
        60,                                                   // fov
        container.clientWidth / container.clientHeight,       // aspect
        0.1,                                                  // near
        1000,                                                 // far
    );

    // Start slightly elevated and pulled back so the ground is visible
    camera.position.set(0, 8, 20);
    camera.lookAt(0, 0, 0);

    return camera;
}

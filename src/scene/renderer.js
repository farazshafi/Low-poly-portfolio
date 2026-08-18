import * as THREE from 'three';

/**
 * Creates and configures the WebGLRenderer.
 * @param {HTMLElement} container - DOM element to append the canvas to.
 * @returns {THREE.WebGLRenderer}
 */
export function createRenderer(container) {
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Correct output color space for Three.js r152+
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Soft shadow maps
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Tone mapping for a nicer look
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    container.appendChild(renderer.domElement);

    return renderer;
}

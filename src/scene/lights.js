import * as THREE from 'three';

/**
 * Adds ambient + directional lights to the scene.
 * @param {THREE.Scene} scene
 */
export function createLights(scene) {
    // Soft ambient fill
    const ambient = new THREE.AmbientLight(0xffeedd, 0.6);
    scene.add(ambient);

    // Primary sun-like directional light with shadows
    const sun = new THREE.DirectionalLight(0xfff5e0, 2.0);
    sun.position.set(50, 80, 30);
    sun.castShadow = true;

    // Shadow camera frustum — covers the visible world area
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 300;
    sun.shadow.camera.left = -80;
    sun.shadow.camera.right = 80;
    sun.shadow.camera.top = 80;
    sun.shadow.camera.bottom = -80;

    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.bias = -0.0005;

    scene.add(sun);

    return { ambient, sun };
}

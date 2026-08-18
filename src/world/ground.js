import * as THREE from 'three';

/**
 * Creates a large flat low-poly ground plane and adds it to the scene.
 * @param {THREE.Scene} scene
 * @returns {THREE.Mesh}
 */
export function createGround(scene) {
    // A few segments gives the flat-shaded low-poly aesthetic
    const geometry = new THREE.PlaneGeometry(200, 200, 20, 20);

    // Slightly randomize Y of interior vertices for a subtle terrain feel
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        // Leave the very edges flat so we don't see cracks at the horizon
        const x = pos.getX(i);
        const z = pos.getY(i); // PlaneGeometry uses Y before rotation
        const isEdge = Math.abs(x) > 95 || Math.abs(z) > 95;
        if (!isEdge) {
            pos.setZ(i, (Math.random() - 0.5) * 0.4);
        }
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: 0x4a7c59,
        flatShading: true,        // low-poly look
        roughness: 0.9,
        metalness: 0.0,
    });

    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2; // lay flat
    ground.receiveShadow = true;

    scene.add(ground);
    return ground;
}

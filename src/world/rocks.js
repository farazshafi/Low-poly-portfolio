import * as THREE from 'three';
import { getHeightAt } from './terrain.js';

// ─── Tweak rock appearance ────────────────────────────────────────────────────

export const ROCK_CONFIG = {
    COUNT: 28,
    COLORS: [
        0x8a7a6a,   // warm grey
        0x7a6a58,
        0x9a8a78,
        0x6a5c4e,
    ],
    SCALE_MIN: 0.8,
    SCALE_MAX: 3.5,
    // Rocks are scattered in the transition zone between playable area & mountains
    RING_MIN: 48,
    RING_MAX: 62,
    DETAIL: 1,   // IcosahedronGeometry detail — keep at 1 for faceted look
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Randomise vertex positions of an IcosahedronGeometry to make
 * it look like a rough boulder rather than a perfect sphere.
 */
function jaggify(geo, amount) {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * amount);
        pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * amount * 0.5);
        pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * amount);
    }
    geo.computeVertexNormals();
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Creates an InstancedMesh of jagged low-poly boulders near the mountain edge.
 * @param {THREE.Scene} scene
 * @returns {THREE.InstancedMesh}
 */
export function createRocks(scene) {
    const cfg = ROCK_CONFIG;

    // Base geometry — IcosahedronGeometry detail=1 gives 20 visible triangles
    const geo = new THREE.IcosahedronGeometry(1, cfg.DETAIL);
    jaggify(geo, 0.35);

    const mat = new THREE.MeshStandardMaterial({
        flatShading: true,
        roughness: 0.95,
        metalness: 0.05,
    });

    const rocks = new THREE.InstancedMesh(geo, mat, cfg.COUNT);
    rocks.castShadow = true;
    rocks.receiveShadow = true;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < cfg.COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = cfg.RING_MIN + Math.random() * (cfg.RING_MAX - cfg.RING_MIN);
        const wx = Math.cos(angle) * radius;
        const wz = Math.sin(angle) * radius;
        const ground = getHeightAt(wx, wz);

        const sx = cfg.SCALE_MIN + Math.random() * (cfg.SCALE_MAX - cfg.SCALE_MIN);
        const sy = sx * (0.5 + Math.random() * 0.7);   // squash vertically
        const sz = sx * (0.8 + Math.random() * 0.4);

        dummy.position.set(wx, ground + sy * 0.35, wz); // half-bury in terrain
        dummy.rotation.set(
            (Math.random() - 0.5) * 0.6,
            Math.random() * Math.PI * 2,
            (Math.random() - 0.5) * 0.4,
        );
        dummy.scale.set(sx, sy, sz);
        dummy.updateMatrix();
        rocks.setMatrixAt(i, dummy.matrix);

        const col = new THREE.Color(cfg.COLORS[Math.floor(Math.random() * cfg.COLORS.length)]);
        rocks.setColorAt(i, col);
    }

    rocks.instanceMatrix.needsUpdate = true;
    if (rocks.instanceColor) rocks.instanceColor.needsUpdate = true;

    scene.add(rocks);
    return rocks;
}

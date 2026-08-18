import * as THREE from 'three';
import { getHeightAt } from './terrain.js';

// ─── Tweak tree appearance ────────────────────────────────────────────────────

export const TREE_CONFIG = {
    COUNT: 85,

    // Trunk
    TRUNK_COLOR: 0x6b4a2a,
    TRUNK_RADIUS_BOT: 0.22,
    TRUNK_RADIUS_TOP: 0.10,
    TRUNK_HEIGHT_MIN: 1.2,
    TRUNK_HEIGHT_MAX: 2.5,
    TRUNK_SEGMENTS: 5,    // pentagons for low-poly

    // Canopy
    CANOPY_COLORS: [
        0x3d5c28,   // deep forest green
        0x4a6830,   // mid olive
        0x5a7a38,   // bright olive
        0x3a5020,   // dark forest
    ],
    CANOPY_RADIUS_MIN: 1.4,
    CANOPY_RADIUS_MAX: 3.0,
    CANOPY_HEIGHT_MIN: 2.5,
    CANOPY_HEIGHT_MAX: 5.5,
    CANOPY_SEGMENTS: 5,

    // Cluster centres [ [cx, cz, spread, count] ]
    // Spread = half-radius of cluster
    CLUSTERS: [
        [15, 15, 10, 20],   // NE park cluster
        [-18, 12, 9, 18],   // NW cluster
        [10, -20, 11, 16],   // SE cluster
        [-12, -18, 8, 12],   // SW cluster
        [0, 8, 6, 8],   // centre-north accent
    ],
    // Remaining trees scattered in the mid-ring and ridge silhouettes
    SCATTER_RADIUS_MIN: 30,
    SCATTER_RADIUS_MAX: 58,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setInstanceMatrix(mesh, idx, x, y, z, scaleX, scaleY, scaleZ, rotY) {
    const dummy = new THREE.Object3D();
    dummy.position.set(x, y, z);
    dummy.rotation.y = rotY;
    dummy.scale.set(scaleX, scaleY, scaleZ);
    dummy.updateMatrix();
    mesh.setMatrixAt(idx, dummy.matrix);
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Creates the full forest using two InstancedMeshes (trunks + canopies).
 * @param {THREE.Scene} scene
 * @returns {{ trunks: THREE.InstancedMesh, canopies: THREE.InstancedMesh }}
 */
export function createTrees(scene) {
    const cfg = TREE_CONFIG;

    // ── Geometry / material (shared across all instances) ──
    const trunkGeo = new THREE.CylinderGeometry(
        cfg.TRUNK_RADIUS_TOP, cfg.TRUNK_RADIUS_BOT, 1,
        cfg.TRUNK_SEGMENTS,
    );
    const trunkMat = new THREE.MeshStandardMaterial({
        color: cfg.TRUNK_COLOR,
        flatShading: true,
        roughness: 1.0,
    });

    const canopyGeo = new THREE.ConeGeometry(1, 1, cfg.CANOPY_SEGMENTS);
    // We'll use per-instance color via setColorAt
    const canopyMat = new THREE.MeshStandardMaterial({
        flatShading: true,
        roughness: 0.9,
        vertexColors: false,
    });

    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, cfg.COUNT);
    const canopies = new THREE.InstancedMesh(canopyGeo, canopyMat, cfg.COUNT);
    trunks.castShadow = canopies.castShadow = true;
    trunks.receiveShadow = canopies.receiveShadow = true;

    // ── Place instances ──
    const positions = [];   // collect [x, z] pairs from clusters first

    // 1. Cluster trees
    for (const [cx, cz, spread, count] of cfg.CLUSTERS) {
        for (let i = 0; i < count && positions.length < cfg.COUNT; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = Math.random() * spread;
            positions.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
        }
    }

    // 2. Scatter remaining trees in mid-ring
    while (positions.length < cfg.COUNT) {
        const a = Math.random() * Math.PI * 2;
        const r = cfg.SCATTER_RADIUS_MIN + Math.random() * (cfg.SCATTER_RADIUS_MAX - cfg.SCATTER_RADIUS_MIN);
        positions.push([Math.cos(a) * r, Math.sin(a) * r]);
    }

    // ── Apply matrices ──
    for (let i = 0; i < cfg.COUNT; i++) {
        const [wx, wz] = positions[i];
        const ground = getHeightAt(wx, wz);

        const trunkH = cfg.TRUNK_HEIGHT_MIN + Math.random() * (cfg.TRUNK_HEIGHT_MAX - cfg.TRUNK_HEIGHT_MIN);
        const canopR = cfg.CANOPY_RADIUS_MIN + Math.random() * (cfg.CANOPY_RADIUS_MAX - cfg.CANOPY_RADIUS_MIN);
        const canopH = cfg.CANOPY_HEIGHT_MIN + Math.random() * (cfg.CANOPY_HEIGHT_MAX - cfg.CANOPY_HEIGHT_MIN);
        const rotY = Math.random() * Math.PI * 2;
        const lean = 0.98 + Math.random() * 0.04; // very subtle lean

        // Trunk: scale Y = trunkH, placed so base sits on ground
        setInstanceMatrix(trunks, i,
            wx, ground + trunkH * 0.5, wz,
            lean, trunkH, lean,
            rotY,
        );

        // Canopy: scale X/Z = canopR, Y = canopH, placed on top of trunk
        setInstanceMatrix(canopies, i,
            wx, ground + trunkH + canopH * 0.45, wz,
            canopR, canopH, canopR,
            rotY,
        );

        // Per-instance canopy color
        const col = new THREE.Color(cfg.CANOPY_COLORS[Math.floor(Math.random() * cfg.CANOPY_COLORS.length)]);
        canopies.setColorAt(i, col);
    }

    trunks.instanceMatrix.needsUpdate = true;
    canopies.instanceMatrix.needsUpdate = true;
    if (canopies.instanceColor) canopies.instanceColor.needsUpdate = true;

    scene.add(trunks);
    scene.add(canopies);

    return { trunks, canopies };
}

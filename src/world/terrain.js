import * as THREE from 'three';

// ─── Tweak terrain feel ───────────────────────────────────────────────────────

export const TERRAIN_CONFIG = {
    SIZE: 200,    // world units, matches old ground plane
    SEGMENTS: 60,    // keep low-ish for visible facets
    MAX_HEIGHT: 5.5,  // max hill height in world units
    NOISE_SCALE: 0.028,  // lower = broader hills
    OCTAVES: 4,
    FLAT_RADIUS: 22,    // inner flat zone radius (playable area)
    RISE_RADIUS: 42,    // where hills reach full strength
    COLOR_LOW: new THREE.Color(0x4e7240),   // olive green valley
    COLOR_MID: new THREE.Color(0x7a6a38),   // warm gold mid-slope
    COLOR_HIGH: new THREE.Color(0x8a7055),   // muted earthy brown high
};

// ─── Internal noise primitives ────────────────────────────────────────────────

function smoothstep(t) { return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }

// Deterministic pseudo-random hash — returns [0, 1]
function hash(ix, iz) {
    const n = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453;
    return n - Math.floor(n);
}

// Bilinear value noise
function noise(x, z) {
    const ix = Math.floor(x), iz = Math.floor(z);
    const fx = x - ix, fz = z - iz;
    const ux = smoothstep(fx), uz = smoothstep(fz);
    return lerp(
        lerp(hash(ix, iz), hash(ix + 1, iz), ux),
        lerp(hash(ix, iz + 1), hash(ix + 1, iz + 1), ux),
        uz,
    );
}

// Fractional Brownian Motion — layered octaves
function fbm(x, z, octaves) {
    let val = 0, amp = 1, freq = 1, sum = 0;
    for (let i = 0; i < octaves; i++) {
        val += noise(x * freq, z * freq) * amp;
        sum += amp;
        amp *= 0.5;
        freq *= 2.1;
    }
    return val / sum; // normalized [0, 1]
}

// ─── Public height query ──────────────────────────────────────────────────────

/**
 * Returns world-space Y (height) at any (worldX, worldZ) coordinate.
 * Uses the same fbm function as the terrain geometry, so results match
 * the actual mesh surface for player grounding.
 *
 * @param {number} worldX
 * @param {number} worldZ
 * @returns {number}
 */
export function getHeightAt(worldX, worldZ) {
    const { NOISE_SCALE, OCTAVES, MAX_HEIGHT, FLAT_RADIUS, RISE_RADIUS } = TERRAIN_CONFIG;

    const dist = Math.sqrt(worldX * worldX + worldZ * worldZ);
    const radialT = smoothstep(Math.max(0, Math.min(1, (dist - FLAT_RADIUS) / (RISE_RADIUS - FLAT_RADIUS))));
    const noiseVal = fbm(worldX * NOISE_SCALE, worldZ * NOISE_SCALE, OCTAVES);

    return (noiseVal * 2 - 0.5) * MAX_HEIGHT * radialT;
}

// ─── Terrain mesh ─────────────────────────────────────────────────────────────

/**
 * Creates the low-poly terrain mesh and adds it to the scene.
 * @param {THREE.Scene} scene
 * @returns {THREE.Mesh}
 */
export function createTerrain(scene) {
    const { SIZE, SEGMENTS, COLOR_LOW, COLOR_MID, COLOR_HIGH } = TERRAIN_CONFIG;

    const geometry = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
    geometry.rotateX(-Math.PI / 2); // lay flat before displacing

    const pos = geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
        const wx = pos.getX(i);
        const wz = pos.getZ(i);
        const h = getHeightAt(wx, wz);
        pos.setY(i, h);

        // Vertex color based on height
        const t = Math.max(0, Math.min(1, (h + 1) / (TERRAIN_CONFIG.MAX_HEIGHT + 1)));
        const col = t < 0.4
            ? COLOR_LOW.clone().lerp(COLOR_MID, t / 0.4)
            : COLOR_MID.clone().lerp(COLOR_HIGH, (t - 0.4) / 0.6);

        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true,
        roughness: 0.95,
        metalness: 0.0,
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.receiveShadow = true;
    terrain.castShadow = false;
    scene.add(terrain);

    return terrain;
}

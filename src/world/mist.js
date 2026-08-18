import * as THREE from 'three';

// ─── Tweak these to adjust the mist ──────────────────────────────────────────

export const MIST_CONFIG = {
    PARTICLE_COUNT: 120,
    SPREAD_X: 90,    // half-width of spawn area
    SPREAD_Z: 90,    // half-depth of spawn area
    HEIGHT_MIN: 0.1,   // particles float just above the ground
    HEIGHT_MAX: 2.5,
    SIZE_MIN: 4,     // billboard size in world units
    SIZE_MAX: 12,
    COLOR: 0xf5d9aa,  // warm dusty gold
    OPACITY_MAX: 0.07,      // semi-transparent — subtle!
    DRIFT_SPEED: 0.004,     // how fast particles drift per frame (world units)
};

/**
 * Creates a Points-based mist/fog particle system near the ground.
 * Each particle drifts slowly in a random XZ direction.
 *
 * Call `updateMist(mist)` every frame to animate drift.
 *
 * @param {THREE.Scene} scene
 * @returns {{ points: THREE.Points, update: () => void }}
 */
export function createMist(scene) {
    const { PARTICLE_COUNT, SPREAD_X, SPREAD_Z,
        HEIGHT_MIN, HEIGHT_MAX, COLOR,
        SIZE_MIN, SIZE_MAX, OPACITY_MAX, DRIFT_SPEED } = MIST_CONFIG;

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const directions = []; // per-particle XZ drift vector (unit, then scaled)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * SPREAD_X * 2;
        positions[i3 + 1] = HEIGHT_MIN + Math.random() * (HEIGHT_MAX - HEIGHT_MIN);
        positions[i3 + 2] = (Math.random() - 0.5) * SPREAD_Z * 2;

        const angle = Math.random() * Math.PI * 2;
        const speed = DRIFT_SPEED * (0.4 + Math.random() * 0.6);
        directions.push({ dx: Math.cos(angle) * speed, dz: Math.sin(angle) * speed });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: COLOR,
        size: SIZE_MIN + Math.random() * (SIZE_MAX - SIZE_MIN),
        sizeAttenuation: true,
        transparent: true,
        opacity: OPACITY_MAX,
        depthWrite: false,     // don't write to depth — avoids sorting artifacts
        blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false; // always render
    scene.add(points);

    // Drift update — wraps particles back when they leave the spawn volume
    function update() {
        const pos = geometry.attributes.position.array;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;
            pos[i3] += directions[i].dx;
            pos[i3 + 2] += directions[i].dz;

            // Wrap around
            const half = SPREAD_X;
            if (pos[i3] > half) pos[i3] = -half;
            if (pos[i3] < -half) pos[i3] = half;
            if (pos[i3 + 2] > half) pos[i3 + 2] = -half;
            if (pos[i3 + 2] < -half) pos[i3 + 2] = half;
        }
        geometry.attributes.position.needsUpdate = true;
    }

    return { points, update };
}

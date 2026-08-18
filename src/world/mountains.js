import * as THREE from 'three';

// ─── Tweak mountain appearance ────────────────────────────────────────────────

export const MOUNTAIN_CONFIG = {
    RING_RADIUS_MIN: 62,   // inner edge of mountain band
    RING_RADIUS_MAX: 90,   // outer edge
    COUNT: 22,   // number of mountain peaks
    HEIGHT_MIN: 22,
    HEIGHT_MAX: 55,
    BASE_RADIUS_MIN: 8,
    BASE_RADIUS_MAX: 20,
    RADIAL_SEGMENTS: 6,   // keep low for faceted look
    HEIGHT_SEGMENTS: 2,
    COLORS: [
        0x7a6555,  // warm earthy brown
        0x6e5c4a,
        0x8a7462,
        0x695040,
    ],
};

/**
 * Places a ring of low-poly mountains around the playable area.
 * @param {THREE.Scene} scene
 * @returns {THREE.Group}
 */
export function createMountains(scene) {
    const cfg = MOUNTAIN_CONFIG;
    const group = new THREE.Group();

    for (let i = 0; i < cfg.COUNT; i++) {
        // Distribute peaks with slight angle jitter so they're not perfectly regular
        const baseAngle = (i / cfg.COUNT) * Math.PI * 2;
        const jitter = (Math.random() - 0.5) * ((Math.PI * 2) / cfg.COUNT) * 0.7;
        const angle = baseAngle + jitter;

        const radius = cfg.RING_RADIUS_MIN + Math.random() * (cfg.RING_RADIUS_MAX - cfg.RING_RADIUS_MIN);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const height = cfg.HEIGHT_MIN + Math.random() * (cfg.HEIGHT_MAX - cfg.HEIGHT_MIN);
        const baseRadius = cfg.BASE_RADIUS_MIN + Math.random() * (cfg.BASE_RADIUS_MAX - cfg.BASE_RADIUS_MIN);

        const geometry = new THREE.ConeGeometry(
            baseRadius,
            height,
            cfg.RADIAL_SEGMENTS,
            cfg.HEIGHT_SEGMENTS,
        );

        // Slightly squash/stretch and rotate each peak for variety
        geometry.rotateY(Math.random() * Math.PI * 2);
        geometry.scale(
            0.85 + Math.random() * 0.3,
            1.0,
            0.85 + Math.random() * 0.3,
        );

        // Randomise vertex positions slightly for a chunkier look
        const pos = geometry.attributes.position;
        for (let v = 0; v < pos.count; v++) {
            const py = pos.getY(v);
            // Only jitter mid-section verts, leave tip and base alone
            if (py > -height * 0.48 && py < height * 0.48) {
                pos.setX(v, pos.getX(v) + (Math.random() - 0.5) * 1.5);
                pos.setZ(v, pos.getZ(v) + (Math.random() - 0.5) * 1.5);
            }
        }
        geometry.computeVertexNormals();

        const color = cfg.COLORS[Math.floor(Math.random() * cfg.COLORS.length)];
        const material = new THREE.MeshStandardMaterial({
            color,
            flatShading: true,
            roughness: 0.95,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, height / 2 - 2, z);  // bury base slightly below terrain
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        group.add(mesh);

        // Add a smaller overlapping neighbour ~30 % of the time for ridgelines
        if (Math.random() < 0.3) {
            const nx = x + (Math.random() - 0.5) * baseRadius * 1.4;
            const nz = z + (Math.random() - 0.5) * baseRadius * 1.4;
            const nh = height * (0.5 + Math.random() * 0.4);
            const nb = baseRadius * (0.5 + Math.random() * 0.3);

            const nGeo = new THREE.ConeGeometry(nb, nh, cfg.RADIAL_SEGMENTS, 1);
            nGeo.rotateY(Math.random() * Math.PI * 2);
            nGeo.computeVertexNormals();

            const nMesh = new THREE.Mesh(
                nGeo,
                new THREE.MeshStandardMaterial({
                    color: cfg.COLORS[Math.floor(Math.random() * cfg.COLORS.length)],
                    flatShading: true,
                    roughness: 0.95,
                }),
            );
            nMesh.position.set(nx, nh / 2 - 2, nz);
            nMesh.castShadow = true;
            group.add(nMesh);
        }
    }

    scene.add(group);
    return group;
}

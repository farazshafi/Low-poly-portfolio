import * as THREE from 'three';
import { ZONE_DEFS } from './zoneConfig.js';

// ─── Tweak beacon appearance ──────────────────────────────────────────────────

const BEACON_CONFIG = {
    POLE_HEIGHT: 7.0,       // world units
    POLE_RADIUS: 0.06,
    DIAMOND_SIZE: 0.55,
    BASE_RADIUS: 0.55,
    BASE_HEIGHT: 0.22,
    BOB_AMP: 0.30,      // up-down bob amplitude
    BOB_FREQ: 1.8,       // cycles per second
    ROT_SPEED: 0.9,       // radians per second
    LIGHT_DISTANCE: 18,
    LIGHT_INTENSITY: 3.5,
    RING_RADIUS: 1.2,       // flat ring on the ground
    RING_SEGMENTS: 6,
};

/**
 * Builds one low-poly beacon at the given zone definition and adds it to scene.
 * Returns an `update(time)` function to call each frame for animation.
 *
 * @param {THREE.Scene} scene
 * @param {object}      zoneDef  — from ZONE_DEFS
 * @returns {{ update: (time: number) => void }}
 */
function buildBeacon(scene, zoneDef) {
    const cfg = BEACON_CONFIG;
    const col = new THREE.Color(zoneDef.color);
    const { x, y, z } = zoneDef.position;

    const group = new THREE.Group();
    group.position.set(x, y, z);

    // ── Ground ring (flat hexagon) ───────────────────────────────────────────
    const ringGeo = new THREE.CylinderGeometry(
        cfg.RING_RADIUS, cfg.RING_RADIUS, 0.05, cfg.RING_SEGMENTS,
    );
    const ringMat = new THREE.MeshStandardMaterial({
        color: col.clone().multiplyScalar(0.6),
        flatShading: true,
        roughness: 0.7,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.03;
    ring.receiveShadow = true;
    group.add(ring);

    // ── Triangular base ──────────────────────────────────────────────────────
    const baseGeo = new THREE.CylinderGeometry(
        cfg.BASE_RADIUS * 0.6, cfg.BASE_RADIUS, cfg.BASE_HEIGHT, 3,
    );
    const baseMat = new THREE.MeshStandardMaterial({
        color: 0x2a2215,
        flatShading: true,
        roughness: 0.9,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = cfg.BASE_HEIGHT / 2;
    base.castShadow = true;
    group.add(base);

    // ── Pole ─────────────────────────────────────────────────────────────────
    const poleGeo = new THREE.CylinderGeometry(
        cfg.POLE_RADIUS * 0.6, cfg.POLE_RADIUS, cfg.POLE_HEIGHT, 5,
    );
    const poleMat = new THREE.MeshStandardMaterial({
        color: 0x3a3020,
        flatShading: true,
        roughness: 0.8,
    });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = cfg.BASE_HEIGHT + cfg.POLE_HEIGHT / 2;
    pole.castShadow = true;
    group.add(pole);

    // ── Floating diamond (OctahedronGeometry detail=0) ───────────────────────
    const diamondGeo = new THREE.OctahedronGeometry(cfg.DIAMOND_SIZE, 0);
    const diamondMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col.clone().multiplyScalar(0.55),
        flatShading: true,
        roughness: 0.2,
        metalness: 0.1,
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    const restY = cfg.BASE_HEIGHT + cfg.POLE_HEIGHT + cfg.DIAMOND_SIZE * 0.9;
    diamond.position.y = restY;
    diamond.castShadow = true;
    group.add(diamond);

    // ── Point light (zone colour glow) ───────────────────────────────────────
    const light = new THREE.PointLight(
        zoneDef.color,
        cfg.LIGHT_INTENSITY,
        cfg.LIGHT_DISTANCE,
        1.8,
    );
    light.position.y = restY;
    group.add(light);

    scene.add(group);

    // ── Per-frame animation ───────────────────────────────────────────────────
    function update(time) {
        const bob = Math.sin(time * cfg.BOB_FREQ * Math.PI * 2) * cfg.BOB_AMP;
        diamond.position.y = restY + bob;
        light.position.y = restY + bob;
        diamond.rotation.y += cfg.ROT_SPEED * (1 / 60); // approx per-frame

        // Pulse light intensity gently
        light.intensity = cfg.LIGHT_INTENSITY + Math.sin(time * 3.1) * 0.8;
    }

    return { update };
}

/**
 * Creates all zone markers for every definition in ZONE_DEFS.
 * @param {THREE.Scene} scene
 * @returns {Array<{ id: string, update: (time: number) => void }>}
 */
export function createMarkers(scene) {
    return ZONE_DEFS.map((def) => {
        const { update } = buildBeacon(scene, def);
        return { id: def.id, update };
    });
}

import * as THREE from 'three';

// ─── Tweak character look ─────────────────────────────────────────────────────

export const CHARACTER_CONFIG = {
    BODY_COLOR: 0x3a7a8a,  // teal-blue jacket
    LIMB_COLOR: 0x3a7a8a,  // same — arms match jacket
    LEG_COLOR: 0x2a2a3e,  // dark indigo trousers
    SKIN_COLOR: 0xe8c49a,  // warm peach
    HAT_COLOR: 0x3a2010,  // dark brown

    // Animation
    BOB_FREQ: 8.0,     // steps per second (radians)
    BOB_AMP: 0.032,   // head vertical bob amplitude
    SWING_AMP: 0.40,    // max arm/leg rotation (radians)
    SQUASH_SPRING: 10,      // lerp speed for squash-stretch
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mat(hex) {
    return new THREE.MeshStandardMaterial({ color: hex, flatShading: true, roughness: 0.9 });
}

function box(w, h, d) { return new THREE.BoxGeometry(w, h, d); }
function cyl(rt, rb, h, seg) { return new THREE.CylinderGeometry(rt, rb, h, seg); }

/**
 * Wraps a mesh in a pivot Group so rotation happens around the pivot origin.
 * @param {THREE.Mesh}   mesh
 * @param {number}       localY  offset of mesh center from pivot (usually -halfHeight)
 */
function pivotWrap(mesh, localY) {
    const pivot = new THREE.Group();
    mesh.position.y = localY;
    pivot.add(mesh);
    return pivot;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Builds a simple low-poly humanoid and adds it to the scene.
 * Character pivot is at y = 0 (feet level).
 *
 * @param {THREE.Scene} scene
 * @returns {{ group: THREE.Group, animate: (state: object) => void }}
 */
export function createCharacter(scene) {
    const c = CHARACTER_CONFIG;
    const grp = new THREE.Group();

    // ── Legs (pivot at hip = y 0.72) ──────────────────────────────────────────
    const legGeo = box(0.22, 0.72, 0.22);

    const lLeg = new THREE.Mesh(legGeo, mat(c.LEG_COLOR));
    const rLeg = new THREE.Mesh(legGeo, mat(c.LEG_COLOR));
    lLeg.castShadow = rLeg.castShadow = true;

    const lLegPivot = pivotWrap(lLeg, -0.36);
    const rLegPivot = pivotWrap(rLeg, -0.36);
    lLegPivot.position.set(-0.14, 0.72, 0);
    rLegPivot.position.set(0.14, 0.72, 0);
    grp.add(lLegPivot, rLegPivot);

    // ── Body (torso) ───────────────────────────────────────────────────────────
    const body = new THREE.Mesh(box(0.58, 0.68, 0.30), mat(c.BODY_COLOR));
    body.position.set(0, 1.06, 0);
    body.castShadow = true;
    grp.add(body);

    // ── Arms (pivot at shoulder = y 1.4) ──────────────────────────────────────
    const armGeo = box(0.18, 0.60, 0.20);

    const lArm = new THREE.Mesh(armGeo, mat(c.LIMB_COLOR));
    const rArm = new THREE.Mesh(armGeo, mat(c.LIMB_COLOR));
    lArm.castShadow = rArm.castShadow = true;

    const lArmPivot = pivotWrap(lArm, -0.30);
    const rArmPivot = pivotWrap(rArm, -0.30);
    lArmPivot.position.set(-0.40, 1.40, 0);
    rArmPivot.position.set(0.40, 1.40, 0);
    grp.add(lArmPivot, rArmPivot);

    // ── Neck ──────────────────────────────────────────────────────────────────
    const neck = new THREE.Mesh(cyl(0.08, 0.09, 0.14, 5), mat(c.SKIN_COLOR));
    neck.position.set(0, 1.47, 0);
    grp.add(neck);

    // ── Head ──────────────────────────────────────────────────────────────────
    const head = new THREE.Mesh(box(0.40, 0.40, 0.40), mat(c.SKIN_COLOR));
    head.position.set(0, 1.72, 0);
    head.castShadow = true;
    grp.add(head);

    // ── Hat ──────────────────────────────────────────────────────────────────
    const hatBrim = new THREE.Mesh(box(0.56, 0.06, 0.56), mat(c.HAT_COLOR));
    hatBrim.position.set(0, 0.03, 0);
    const hatTop = new THREE.Mesh(box(0.36, 0.32, 0.36), mat(c.HAT_COLOR));
    hatTop.position.set(0, 0.22, 0);
    const hat = new THREE.Group();
    hat.add(hatBrim, hatTop);
    hat.position.set(0, 1.90, 0);
    grp.add(hat);

    scene.add(grp);

    // ── Squash-stretch state ───────────────────────────────────────────────────
    let currentStretch = 1.0;

    // ── Animate ───────────────────────────────────────────────────────────────
    /**
     * @param {{ isMoving: boolean, isGrounded: boolean, time: number,
     *            speed: number, targetStretch: number, delta: number }} state
     */
    function animate({ isMoving, isGrounded, time, targetStretch, delta }) {
        const { BOB_FREQ, BOB_AMP, SWING_AMP, SQUASH_SPRING } = CHARACTER_CONFIG;

        // Walking swing
        const t = isMoving ? time * BOB_FREQ : 0;
        const swing = isMoving ? Math.sin(t) * SWING_AMP : 0;
        const bobY = isMoving ? Math.sin(t * 2) * BOB_AMP : 0; // body bobs twice per stride

        lLegPivot.rotation.x = swing;
        rLegPivot.rotation.x = -swing;
        lArmPivot.rotation.x = -swing * 0.55;
        rArmPivot.rotation.x = swing * 0.55;

        head.position.y = 1.72 + bobY * 0.8;
        hat.position.y = 1.90 + bobY * 0.8;
        body.position.y = 1.06 + bobY;

        // Squash-stretch (lerped)
        currentStretch += (targetStretch - currentStretch) * Math.min(SQUASH_SPRING * delta, 1);
        const s = currentStretch;
        body.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));

        // Tilt body slightly forward when moving
        body.rotation.x = isMoving ? -0.07 : 0;
    }

    return { group: grp, animate };
}

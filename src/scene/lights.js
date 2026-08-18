import * as THREE from 'three';

// ─── Tweak these constants to change the mood ─────────────────────────────────

export const LIGHT_CONFIG = {
    // Low-angle golden sun
    SUN_COLOR: 0xff9a4d,   // warm orange-gold
    SUN_INTENSITY: 3.5,
    SUN_POSITION: new THREE.Vector3(-60, 15, -40), // low on the horizon

    // Hemisphere sky/ground fill
    SKY_COLOR: 0xffcb8a,   // warm peach sky
    GROUND_COLOR: 0x6b4a2a,   // muted earthy brown
    HEMI_INTENSITY: 0.7,

    // Shadow settings
    SHADOW_MAP_SIZE: 2048,
    SHADOW_CAM_RANGE: 80,
    SHADOW_BIAS: -0.001,
};

/**
 * Adds golden-hour directional sun + hemisphere fill light to the scene.
 * @param {THREE.Scene} scene
 * @returns {{ sun: THREE.DirectionalLight, hemi: THREE.HemisphereLight }}
 */
export function createLights(scene) {
    // Warm hemisphere fill — sky peach / ground brown
    const hemi = new THREE.HemisphereLight(
        LIGHT_CONFIG.SKY_COLOR,
        LIGHT_CONFIG.GROUND_COLOR,
        LIGHT_CONFIG.HEMI_INTENSITY,
    );
    scene.add(hemi);

    // Low-angle golden sun casting soft shadows
    const sun = new THREE.DirectionalLight(
        LIGHT_CONFIG.SUN_COLOR,
        LIGHT_CONFIG.SUN_INTENSITY,
    );
    sun.position.copy(LIGHT_CONFIG.SUN_POSITION);
    sun.castShadow = true;

    const r = LIGHT_CONFIG.SHADOW_CAM_RANGE;
    sun.shadow.camera.left = -r;
    sun.shadow.camera.right = r;
    sun.shadow.camera.top = r;
    sun.shadow.camera.bottom = -r;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 400;
    sun.shadow.mapSize.width = LIGHT_CONFIG.SHADOW_MAP_SIZE;
    sun.shadow.mapSize.height = LIGHT_CONFIG.SHADOW_MAP_SIZE;
    sun.shadow.bias = LIGHT_CONFIG.SHADOW_BIAS;

    scene.add(sun);

    return { sun, hemi };
}

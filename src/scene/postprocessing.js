import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ─── Tweak these to adjust the bloom glow ────────────────────────────────────

export const BLOOM_CONFIG = {
    STRENGTH: 0.35,   // keep low — just enough to make the sun glow
    RADIUS: 0.6,
    THRESHOLD: 0.75,   // only bloom the brightest pixels (sun, specular)
};

/**
 * Creates an EffectComposer with RenderPass → UnrealBloomPass → OutputPass.
 * OutputPass handles color space conversion so the renderer's outputColorSpace
 * setting remains SRGBColorSpace without double-conversion.
 *
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @returns {EffectComposer}
 */
export function createPostProcessing(renderer, scene, camera) {
    const composer = new EffectComposer(renderer);

    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        BLOOM_CONFIG.STRENGTH,
        BLOOM_CONFIG.RADIUS,
        BLOOM_CONFIG.THRESHOLD,
    );
    composer.addPass(bloom);

    // OutputPass converts linear → sRGB correctly when using EffectComposer
    composer.addPass(new OutputPass());

    return composer;
}

/**
 * Resizes the composer to match the current renderer size.
 * Call this inside the window resize handler.
 * @param {EffectComposer} composer
 * @param {number} width
 * @param {number} height
 */
export function resizeComposer(composer, width, height) {
    composer.setSize(width, height);
}

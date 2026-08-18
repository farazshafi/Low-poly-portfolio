import * as THREE from 'three';

// ─── Tweak these constants to change the sky mood ────────────────────────────

export const SKY_CONFIG = {
    DOME_RADIUS: 500,

    // Vertical gradient: bottom → top
    COLOR_HORIZON: new THREE.Color(0xf5a04a),  // golden / amber at horizon
    COLOR_MID: new THREE.Color(0xe8785a),  // dusky rose mid-sky
    COLOR_ZENITH: new THREE.Color(0x3a2d5c),  // deep violet at top
};

/**
 * Creates a large inverted sphere with a GLSL vertical-gradient sky shader.
 * The gradient blends horizon amber → dusky rose → deep violet.
 *
 * @param {THREE.Scene} scene
 * @returns {THREE.Mesh}
 */
export function createSky(scene) {
    const { DOME_RADIUS, COLOR_HORIZON, COLOR_MID, COLOR_ZENITH } = SKY_CONFIG;

    const geometry = new THREE.SphereGeometry(DOME_RADIUS, 32, 16);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uHorizon: { value: COLOR_HORIZON },
            uMid: { value: COLOR_MID },
            uZenith: { value: COLOR_ZENITH },
        },
        vertexShader: /* glsl */`
      varying float vY;
      void main() {
        vY = normalize(position).y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: /* glsl */`
      uniform vec3 uHorizon;
      uniform vec3 uMid;
      uniform vec3 uZenith;
      varying float vY;

      void main() {
        // map [-1, 1] to [0, 1], clamp so below-horizon is pure horizon color
        float t = clamp(vY, 0.0, 1.0);

        // two-stop blend: horizon → mid at t=0.35, mid → zenith at t=1.0
        vec3 col;
        if (t < 0.35) {
          col = mix(uHorizon, uMid, t / 0.35);
        } else {
          col = mix(uMid, uZenith, (t - 0.35) / 0.65);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
        side: THREE.BackSide,   // render inside of sphere
        depthWrite: false,
    });

    const sky = new THREE.Mesh(geometry, material);
    scene.add(sky);

    return sky;
}

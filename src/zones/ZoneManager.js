import { ZONE_DEFS } from './zoneConfig.js';
import { createMarkers } from './markers.js';
import { createPromptUI } from './promptUI.js';

/**
 * ZoneManager — owns zone proximity detection, marker animation,
 * prompt display, and E-key interaction.
 *
 * API:
 *   const zm = new ZoneManager(scene);
 *   // each frame:
 *   zm.update(playerBodyPosition, time);
 *   // read:
 *   zm.isInteracting  → boolean  (pass to controller to pause movement)
 */
export class ZoneManager {
    /**
     * @param {THREE.Scene} scene
     * @param {object}      [callbacks]  optional { zoneId: () => void }
     *   called when player opens that zone. Wire actual UI panels here later.
     */
    constructor(scene, callbacks = {}) {
        // Build runtime zone records (copy def + live state)
        this._zones = ZONE_DEFS.map((def) => ({
            ...def,
            active: false,
        }));

        this._markers = createMarkers(scene);
        this._prompt = createPromptUI();
        this._callbacks = callbacks;

        this._currentZone = null;    // zone the player is currently inside
        this._isInteracting = false;  // true after E is pressed, until E/Esc again
        this._eConsumed = false;   // prevent auto-repeat

        this._bindKeys();
    }

    // ── Key handling ──────────────────────────────────────────────────────────

    _bindKeys() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyE') this._onEDown();
            if (e.code === 'Escape' && this._isInteracting) this._closeInteraction();
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyE') this._eConsumed = false;
        });
    }

    _onEDown() {
        if (this._eConsumed) return;
        this._eConsumed = true;

        if (!this._currentZone) return;

        if (!this._isInteracting) {
            // ── Open ──────────────────────────────────────────────────────────────
            this._isInteracting = true;
            console.log(`[Zone] Opened: ${this._currentZone.id}`);
            this._callbacks[this._currentZone.id]?.();
        } else {
            // ── Close / toggle ────────────────────────────────────────────────────
            this._closeInteraction();
        }
    }

    close() {
        this._closeInteraction();
    }

    _closeInteraction() {
        this._isInteracting = false;
        if (this._currentZone) {
            this._prompt.show(this._currentZone.label, this._currentZone.color);
        } else {
            this._prompt.hide();
        }
        console.log(`[Zone] Closed: ${this._currentZone?.id ?? 'none'}`);
    }

    // ── Per-frame update ──────────────────────────────────────────────────────

    /**
     * @param {{ x: number, y: number, z: number }} bodyPos  cannon-es body position
     * @param {number} time  elapsed time in seconds (from THREE.Clock)
     */
    update(bodyPos, time) {
        // Find the nearest zone the player is inside
        let nearest = null;
        let nearestDist = Infinity;

        for (const zone of this._zones) {
            const dx = bodyPos.x - zone.position.x;
            const dz = bodyPos.z - zone.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < zone.radius && dist < nearestDist) {
                nearest = zone;
                nearestDist = dist;
            }
        }

        // Zone change
        if (nearest !== this._currentZone) {
            // Close any active interaction when leaving a zone
            if (this._isInteracting) this._closeInteraction();

            this._currentZone = nearest;

            if (nearest) {
                this._prompt.show(nearest.label, nearest.color);
            } else {
                this._prompt.hide();
            }
        }

        // Animate all markers
        for (const m of this._markers) {
            m.update(time);
        }
    }

    // ── State accessors ───────────────────────────────────────────────────────

    /** True while the player is in an "open zone" interaction — use to pause movement */
    get isInteracting() { return this._isInteracting; }

    /** The zone the player is currently inside, or null */
    get currentZone() { return this._currentZone; }
}

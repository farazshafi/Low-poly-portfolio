/**
 * InputManager — tracks keyboard and mouse state every frame.
 * Keyboard: WASD / Arrow keys / Space / Shift
 * Mouse:    right-click drag for camera orbit
 */
export class InputManager {
    constructor() {
        this.keys = {
            forward: false,
            back: false,
            left: false,
            right: false,
            sprint: false,
        };
        // jump is an edge-trigger — true only the first frame Space goes down
        this._jumpDown = false;
        this._jumpConsumed = false;

        this.mouse = {
            rightDown: false,
            dx: 0,
            dy: 0,
            _lastX: 0,
            _lastY: 0,
        };

        window.addEventListener('keydown', this._onKeyDown.bind(this));
        window.addEventListener('keyup', this._onKeyUp.bind(this));
        window.addEventListener('mousedown', this._onMouseDown.bind(this));
        window.addEventListener('mouseup', this._onMouseUp.bind(this));
        window.addEventListener('mousemove', this._onMouseMove.bind(this));
        window.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // ── keyboard ────────────────────────────────────────────────────────────────

    _onKeyDown(e) { this._setKey(e.code, true); }
    _onKeyUp(e) { this._setKey(e.code, false); }

    _setKey(code, down) {
        if (code === 'KeyW' || code === 'ArrowUp') this.keys.forward = down;
        if (code === 'KeyS' || code === 'ArrowDown') this.keys.back = down;
        if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = down;
        if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = down;
        if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.sprint = down;
        if (code === 'Space') {
            // Only register a fresh press — prevent auto-repeat jump from holding
            if (down && !this._jumpDown) this._jumpConsumed = false;
            this._jumpDown = down;
        }
    }

    /**
     * Returns true once per Space press.  Resets after being read.
     */
    consumeJump() {
        if (this._jumpDown && !this._jumpConsumed) {
            this._jumpConsumed = true;
            return true;
        }
        return false;
    }

    // ── mouse ───────────────────────────────────────────────────────────────────

    _onMouseDown(e) {
        if (e.button === 2) {
            this.mouse.rightDown = true;
            this.mouse._lastX = e.clientX;
            this.mouse._lastY = e.clientY;
        }
    }
    _onMouseUp(e) {
        if (e.button === 2) this.mouse.rightDown = false;
    }
    _onMouseMove(e) {
        if (!this.mouse.rightDown) return;
        this.mouse.dx += e.clientX - this.mouse._lastX;
        this.mouse.dy += e.clientY - this.mouse._lastY;
        this.mouse._lastX = e.clientX;
        this.mouse._lastY = e.clientY;
    }

    /**
     * Reads accumulated mouse delta since last call and resets it.
     * @returns {{ dx: number, dy: number }}
     */
    consumeMouseDelta() {
        const { dx, dy } = this.mouse;
        this.mouse.dx = 0;
        this.mouse.dy = 0;
        return { dx, dy };
    }
}

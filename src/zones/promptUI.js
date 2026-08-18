/**
 * promptUI.js — thin DOM wrapper for the zone interaction prompt.
 *
 * Creates a single glassmorphism pill at the bottom-center of the screen.
 * Call show(label, color) / hide() from ZoneManager.
 */

const STYLES = `
  #zone-prompt {
    position: fixed;
    bottom: 72px;
    left: 50%;
    transform: translateX(-50%) translateY(6px);
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(10, 8, 6, 0.62);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 999px;
    padding: 9px 22px 9px 16px;
    color: #fff;
    font-family: 'Inter', 'Segoe UI', sans-serif;
    font-size: 13px;
    letter-spacing: 0.02em;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.30s ease, transform 0.30s ease;
    z-index: 100;
    white-space: nowrap;
  }
  #zone-prompt.visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0px);
  }
  #zone-prompt .zp-key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 5px;
    border: 1.5px solid rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.10);
    font-weight: 700;
    font-size: 12px;
    flex-shrink: 0;
  }
  #zone-prompt .zp-accent {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
`;

export function createPromptUI() {
    // Inject stylesheet once
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);

    const el = document.createElement('div');
    el.id = 'zone-prompt';
    el.innerHTML = `
    <span class="zp-accent" id="zp-accent"></span>
    <span class="zp-key">E</span>
    <span id="zp-label">Open</span>
  `;

    const uiRoot = document.getElementById('ui-root') ?? document.body;
    uiRoot.appendChild(el);

    const accentEl = el.querySelector('#zp-accent');
    const labelEl = el.querySelector('#zp-label');

    return {
        /**
         * @param {string} label   zone label, e.g. "Projects"
         * @param {number} color   hex number for accent dot
         */
        show(label, color) {
            labelEl.textContent = `Open ${label}`;
            accentEl.style.background = `#${color.toString(16).padStart(6, '0')}`;
            el.classList.add('visible');
        },
        hide() {
            el.classList.remove('visible');
        },
    };
}

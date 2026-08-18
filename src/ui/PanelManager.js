import { renderProjects } from './ProjectsPanel.js';
import { renderSkills } from './SkillsPanel.js';
import { renderProfile } from './ProfilePanel.js';

// ─── Shared design tokens ─────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* ── Panel overlay ─────────────────────────────────────── */
#panel-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.28s ease;
}
#panel-overlay.open {
  pointer-events: all;
  opacity: 1;
}

/* ── Scrim (blurs the 3D world subtly behind the panel) ── */
#panel-scrim {
  position: absolute;
  inset: 0;
  background: rgba(4, 3, 2, 0.45);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

/* ── The glass panel itself ────────────────────────────── */
#panel-box {
  position: relative;
  width: min(740px, 92vw);
  max-height: 80vh;
  background: rgba(10, 8, 5, 0.90);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(245, 160, 32, 0.18);
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.04) inset;
  transform: scale(0.93) translateY(16px);
  opacity: 0;
  transition:
    transform 0.38s cubic-bezier(0.34, 1.52, 0.64, 1),
    opacity   0.28s ease;
}
#panel-overlay.open #panel-box {
  transform: scale(1) translateY(0);
  opacity: 1;
}

/* ── Header ────────────────────────────────────────────── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}
.panel-title {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
}
.panel-title-accent {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.panel-close {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  background: transparent;
  color: rgba(255,255,255,0.55);
  font-size: 18px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, border-color 0.18s;
  line-height: 1;
  padding: 0;
}
.panel-close:hover {
  background: rgba(245, 160, 32, 0.12);
  border-color: rgba(245, 160, 32, 0.35);
  color: #f5a020;
}

/* ── Scrollable body ────────────────────────────────────── */
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px 28px;
  scroll-behavior: smooth;
}
.panel-body::-webkit-scrollbar { width: 5px; }
.panel-body::-webkit-scrollbar-track { background: transparent; }
.panel-body::-webkit-scrollbar-thumb { background: rgba(245,160,32,0.25); border-radius: 9px; }

.panel-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  margin: 0 0 22px;
  letter-spacing: 0.01em;
}

/* ═══════════════════════════════════════════════════════════
   PROJECTS PANEL
══════════════════════════════════════════════════════════ */
.pp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}
.pp-card {
  display: flex;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255,255,255,0.03);
  transition: border-color 0.2s, background 0.2s;
}
.pp-card:hover {
  border-color: rgba(var(--card-accent-rgb), 0.35);
  background: rgba(255,255,255,0.055);
}
.pp-card-accent-bar {
  width: 4px;
  flex-shrink: 0;
  background: var(--card-accent);
  opacity: 0.85;
}
.pp-card-body {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pp-card-title {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}
.pp-card-desc {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  margin: 0;
  line-height: 1.6;
}
.pp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pp-tag {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: var(--tag-color, #f5a020);
  background: color-mix(in srgb, var(--tag-color, #f5a020) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--tag-color, #f5a020) 30%, transparent);
  border-radius: 6px;
  padding: 2px 8px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.pp-card-links {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.pp-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.18s, color 0.18s;
}
.pp-link svg { width: 13px; height: 13px; }
.pp-link-ghost {
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.65);
}
.pp-link-ghost:hover  { background: rgba(255,255,255,0.08); color: #fff; }
.pp-link-accent {
  background: rgba(245,160,32,0.15);
  border: 1px solid rgba(245,160,32,0.30);
  color: #f5a020;
}
.pp-link-accent:hover { background: rgba(245,160,32,0.28); }

/* ═══════════════════════════════════════════════════════════
   SKILLS PANEL
══════════════════════════════════════════════════════════ */
.sp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 22px;
}
.sp-category {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sp-cat-title {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #f5a020;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(245,160,32,0.18);
}
.sp-cat-icon { font-size: 16px; }
.sp-skills-list { display: flex; flex-direction: column; gap: 12px; }
.sp-skill { display: flex; flex-direction: column; gap: 5px; }
.sp-skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sp-skill-name {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.82);
}
.sp-skill-pct {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: rgba(245,160,32,0.70);
}
.sp-bar-track {
  height: 5px;
  background: rgba(255,255,255,0.08);
  border-radius: 99px;
  overflow: hidden;
}
.sp-bar-fill {
  height: 100%;
  width: 0;                 /* starts at 0; afterMount() sets it */
  background: linear-gradient(90deg, #c97010, #f5a020, #ffd060);
  border-radius: 99px;
  transition: width 0.9s cubic-bezier(0.25, 1, 0.5, 1);
}

/* ═══════════════════════════════════════════════════════════
   PROFILE PANEL
══════════════════════════════════════════════════════════ */
.prp-hero {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 24px;
}
.prp-avatar {
  width: 80px; height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(245,160,32,0.35);
  flex-shrink: 0;
}
.prp-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: 26px;
  font-weight: 700;
  color: #f5a020;
  background: rgba(245,160,32,0.12);
  border: 2px solid rgba(245,160,32,0.30);
  flex-shrink: 0;
}
.prp-hero-info { display: flex; flex-direction: column; gap: 4px; }
.prp-name {
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}
.prp-title-line {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #f5a020;
  margin: 0;
}
.prp-location {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  margin: 0;
}
.prp-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #60e070;
  background: rgba(80,200,100,0.12);
  border: 1px solid rgba(80,200,100,0.28);
  border-radius: 99px;
  padding: 3px 10px;
  margin-top: 4px;
  width: fit-content;
}
.prp-bio {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: rgba(255,255,255,0.62);
  line-height: 1.75;
  margin: 0 0 28px;
}
.prp-socials-heading {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 14px;
}
.prp-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.prp-social {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.75);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 10px;
  padding: 9px 16px;
  text-decoration: none;
  transition: background 0.18s, border-color 0.18s, color 0.18s;
}
.prp-social:hover {
  background: rgba(245,160,32,0.12);
  border-color: rgba(245,160,32,0.32);
  color: #f5a020;
}
.prp-social-icon { width: 17px; height: 17px; display: flex; }
.prp-social-icon svg { width: 100%; height: 100%; }
`;

// ─── Panel titles and accent colours (matches zone colours) ──────────────────

const PANEL_META = {
    projects: { title: 'Projects', accent: '#ffaa33' },
    skills: { title: 'Skills', accent: '#44ccff' },
    profile: { title: 'Profile & Social', accent: '#ff55bb' },
};

const RENDERERS = {
    projects: renderProjects,
    skills: renderSkills,
    profile: renderProfile,
};

// ─── PanelManager ─────────────────────────────────────────────────────────────

/**
 * Controls the full-screen panel overlay.
 *
 * Usage:
 *   const pm = new PanelManager();
 *   pm.onClose = () => zoneManager.close();
 *   pm.open('projects');
 */
export class PanelManager {
    constructor() {
        this._injectCSS();
        this._buildDOM();
        this._bindKeys();
        this.onClose = null;
        this._active = null;
    }

    // ── DOM setup ───────────────────────────────────────────────────────────────

    _injectCSS() {
        const style = document.createElement('style');
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    _buildDOM() {
        const overlay = document.createElement('div');
        overlay.id = 'panel-overlay';

        const scrim = document.createElement('div');
        scrim.id = 'panel-scrim';
        scrim.addEventListener('click', () => this.close()); // click scrim to close

        const box = document.createElement('div');
        box.id = 'panel-box';

        const header = document.createElement('div');
        header.className = 'panel-header';
        header.innerHTML = `
      <span class="panel-title">
        <span class="panel-title-accent" id="pt-accent"></span>
        <span id="pt-label">—</span>
      </span>
      <button class="panel-close" id="panel-close-btn" aria-label="Close">✕</button>
    `;

        const body = document.createElement('div');
        body.className = 'panel-body';
        body.id = 'panel-body-content';

        box.appendChild(header);
        box.appendChild(body);
        overlay.appendChild(scrim);
        overlay.appendChild(box);

        const root = document.getElementById('ui-root') ?? document.body;
        root.appendChild(overlay);

        this._overlay = overlay;
        this._body = body;
        this._accentDot = overlay.querySelector('#pt-accent');
        this._label = overlay.querySelector('#pt-label');
        overlay.querySelector('#panel-close-btn').addEventListener('click', () => this.close());
    }

    _bindKeys() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this._active) this.close();
        });
    }

    // ── Public API ──────────────────────────────────────────────────────────────

    open(panelId) {
        const meta = PANEL_META[panelId];
        const renderer = RENDERERS[panelId];
        if (!meta || !renderer) return;

        const { html, afterMount } = renderer();

        // Update header
        this._accentDot.style.background = meta.accent;
        this._label.textContent = meta.title;

        // Inject content
        this._body.innerHTML = html;

        // Show overlay
        this._active = panelId;
        requestAnimationFrame(() => {
            this._overlay.classList.add('open');
            afterMount(this._body);
        });
    }

    close() {
        if (!this._active) return;
        this._overlay.classList.remove('open');
        this._active = null;
        this.onClose?.();
    }
}

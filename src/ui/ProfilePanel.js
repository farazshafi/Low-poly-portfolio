import { profile } from '../data/profile.js';

// ── Inline SVG icons (no icon-font dependency) ────────────────────────────────

const ICONS = {
    github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 2h3.27l-7.15 8.17L23 22h-6.59l-5.16-6.75L5.07 22H1.8l7.65-8.75L1 2h6.76l4.66 6.1L18.24 2zm-1.15 17.96h1.81L7.02 3.84H5.08l12.01 16.12z"/></svg>`,
    email: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
    web: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`,
};

/**
 * Renders the Profile / Social panel body HTML.
 */
export function renderProfile() {
    const p = profile;

    const initials = p.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

    const avatar = p.avatar
        ? `<img class="prp-avatar" src="${p.avatar}" alt="${p.name}" />`
        : `<div class="prp-avatar prp-avatar-placeholder">${initials}</div>`;

    const availBadge = p.available
        ? `<span class="prp-badge">✦ Open to work</span>` : '';

    const socials = p.socials.map((s) => `
    <a class="prp-social" href="${s.url}" target="_blank" rel="noopener" title="${s.label}">
      <span class="prp-social-icon">${ICONS[s.icon] ?? ICONS.web}</span>
      <span class="prp-social-label">${s.label}</span>
    </a>
  `).join('');

    const html = `
    <div class="prp-hero">
      ${avatar}
      <div class="prp-hero-info">
        <h2 class="prp-name">${p.name}</h2>
        <p class="prp-title-line">${p.title}</p>
        <p class="prp-location">${p.location ?? ''}</p>
        ${availBadge}
      </div>
    </div>
    <p class="prp-bio">${p.bio}</p>
    <h3 class="prp-socials-heading">Find me online</h3>
    <div class="prp-socials">${socials}</div>
  `;

    return { html, afterMount: () => { } };
}

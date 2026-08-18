import { projects } from '../data/projects.js';

/**
 * Renders the Projects panel body HTML.
 * Returns { html: string, afterMount: (el) => void }
 * afterMount is called after the HTML is injected — use it for event listeners.
 */
export function renderProjects() {
    const cards = projects.map((p) => {
        const tags = p.tags
            .map((t) => `<span class="pp-tag" style="--tag-color:${p.color}">${t}</span>`)
            .join('');

        const links = `
      <div class="pp-card-links">
        ${p.link && p.link !== '#'
                ? `<a class="pp-link pp-link-ghost" href="${p.link}" target="_blank" rel="noopener">
               ${githubIcon} GitHub
             </a>`
                : ''}
        ${p.liveLink
                ? `<a class="pp-link pp-link-accent" href="${p.liveLink}" target="_blank" rel="noopener">
               Live ↗
             </a>`
                : ''}
      </div>`;

        return `
      <div class="pp-card" style="--card-accent:${p.color}">
        <div class="pp-card-accent-bar"></div>
        <div class="pp-card-body">
          <h3 class="pp-card-title">${p.title}</h3>
          <p class="pp-card-desc">${p.description}</p>
          <div class="pp-tags">${tags}</div>
          ${links}
        </div>
      </div>`;
    }).join('');

    const html = `
    <p class="panel-subtitle">Things I've built — click for source or live demo.</p>
    <div class="pp-grid">${cards}</div>
  `;

    return { html, afterMount: () => { } };
}

const githubIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"/>
</svg>`;

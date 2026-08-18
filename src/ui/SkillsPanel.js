import { skills } from '../data/skills.js';

/**
 * Renders the Skills panel body HTML.
 * afterMount animates the skill bars in after a brief delay.
 */
export function renderSkills() {
    const categories = skills.map((cat) => {
        const items = cat.items.map((item) => `
      <div class="sp-skill">
        <div class="sp-skill-header">
          <span class="sp-skill-name">${item.name}</span>
          <span class="sp-skill-pct">${item.level}%</span>
        </div>
        <div class="sp-bar-track">
          <div class="sp-bar-fill" data-width="${item.level}%"></div>
        </div>
      </div>
    `).join('');

        return `
      <div class="sp-category">
        <h3 class="sp-cat-title">
          <span class="sp-cat-icon">${cat.icon}</span>
          ${cat.category}
        </h3>
        <div class="sp-skills-list">${items}</div>
      </div>
    `;
    }).join('');

    const html = `
    <p class="panel-subtitle">Technologies I work with day-to-day.</p>
    <div class="sp-grid">${categories}</div>
  `;

    function afterMount(panelBody) {
        // Animate bars in after two frames (ensures CSS transitions fire)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                panelBody.querySelectorAll('.sp-bar-fill').forEach((el) => {
                    el.style.width = el.dataset.width;
                });
            });
        });
    }

    return { html, afterMount };
}

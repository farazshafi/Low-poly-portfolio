/**
 * src/data/skills.js
 * ──────────────────
 * Edit this file to update the Skills panel. No logic changes needed.
 *
 * Fields per item:
 *   name    display label
 *   level   0–100 (used for the visual progress bar width)
 */
export const skills = [
    {
        category: 'Frontend',
        icon: '🎨',
        items: [
            { name: 'React / Next.js', level: 90 },
            { name: 'Three.js / WebGL', level: 82 },
            { name: 'CSS / Animations', level: 85 },
            { name: 'TypeScript', level: 78 },
        ],
    },
    {
        category: 'Backend',
        icon: '⚙️',
        items: [
            { name: 'Node.js / Express', level: 88 },
            { name: 'REST & WebSockets', level: 85 },
            { name: 'MongoDB / Redis', level: 80 },
            { name: 'PostgreSQL', level: 72 },
        ],
    },
    {
        category: 'DevOps & Tools',
        icon: '🔧',
        items: [
            { name: 'Docker / K8s', level: 75 },
            { name: 'Git / CI–CD', level: 87 },
            { name: 'Linux / Shell', level: 72 },
            { name: 'Vite / Webpack', level: 80 },
        ],
    },
];

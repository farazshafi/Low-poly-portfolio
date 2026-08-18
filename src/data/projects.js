/**
 * src/data/projects.js
 * ─────────────────────
 * Edit this file to update project cards. No logic changes needed.
 *
 * Fields:
 *   id          unique string
 *   title       card heading
 *   description one-sentence summary
 *   tags        array of technology strings
 *   link        GitHub / repo URL
 *   liveLink    deployed URL (optional, null to hide)
 *   color       hex accent for the card's left border + tag glow
 */
export const projects = [
    {
        id: 'codie',
        title: 'Codie',
        description: 'A collaborative online code editor with real-time execution, multi-language support, Docker sandbox isolation, and Redis-backed session management.',
        tags: ['Next.js', 'Node.js', 'Docker', 'Redis', 'WebSockets', 'K8s'],
        link: 'https://github.com/farazshafi',
        liveLink: null,
        color: '#44aaff',
    },
    {
        id: 'progad',
        title: 'Progad',
        description: 'A full-stack social platform for competitive programmers — contest tracking, code snippets, comments, and contributor stats.',
        tags: ['React', 'Express', 'MongoDB', 'REST API', 'JWT'],
        link: 'https://github.com/farazshafi',
        liveLink: null,
        color: '#ff9944',
    },
    {
        id: 'portfolio',
        title: 'Low-Poly Portfolio',
        description: 'This interactive 3D portfolio — a walkable sunset world built with Three.js, cannon-es physics, and a custom GLSL sky shader.',
        tags: ['Three.js', 'cannon-es', 'Vite', 'GLSL', 'ES Modules'],
        link: 'https://github.com/farazshafi/Low-poly-portfolio',
        liveLink: null,
        color: '#88dd66',
    },
    {
        id: 'project4',
        title: 'Another Project',
        description: 'Placeholder — replace this with your next project. Edit src/data/projects.js to update.',
        tags: ['TypeScript', 'PostgreSQL', 'Prisma'],
        link: '#',
        liveLink: null,
        color: '#cc66ff',
    },
];

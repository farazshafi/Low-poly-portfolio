/**
 * src/data/profile.js
 * ───────────────────
 * Edit this file to update the Profile panel. No logic changes needed.
 *
 * avatar: URL string or null (shows initials placeholder when null)
 * socials: icon can be 'github' | 'linkedin' | 'twitter' | 'email' | 'web'
 */
export const profile = {
    name: 'Faraz Shafi',
    title: 'Full Stack & Creative Developer',
    bio: 'I build immersive digital experiences — from collaborative developer tools with real-time code execution to interactive 3D worlds rendered in the browser. Passionate about clean architecture, creative engineering, and things that feel alive.',
    avatar: null,   // set to an image URL to show a photo

    location: 'India 🇮🇳',
    available: true,   // shows a green "Open to work" badge when true

    socials: [
        {
            label: 'GitHub',
            url: 'https://github.com/farazshafi',
            icon: 'github',
        },
        {
            label: 'LinkedIn',
            url: 'https://linkedin.com/in/',   // ← update with your URL
            icon: 'linkedin',
        },
        {
            label: 'Twitter',
            url: 'https://twitter.com/',        // ← update with your handle
            icon: 'twitter',
        },
        {
            label: 'Email',
            url: 'mailto:faraz@example.com',   // ← update your email
            icon: 'email',
        },
    ],
};

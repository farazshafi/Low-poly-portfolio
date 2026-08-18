import { defineConfig } from 'vite';

export default defineConfig({
  // Serve static assets from public/
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://parmsam.github.io',
  base: '/health-tracking',
  vite: {
    plugins: [tailwindcss()],
  },
});

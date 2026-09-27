/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The site is served from https://ifishlin.github.io/der-die-das/math/.
// A relative base ('./') keeps every asset path working under any sub-path
// (project repo, user.github.io root repo, or a sub-folder like this one).
// Override with VITE_BASE_PATH if an absolute base is ever needed.
export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE_PATH ?? (command === 'build' ? './' : '/'),
  plugins: [react()],
  build: {
    outDir: process.env.VITE_OUT_DIR ?? '../math',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    include: ['src/tests/**/*.test.{ts,tsx}'],
  },
}));

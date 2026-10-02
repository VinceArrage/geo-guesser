/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` must match the GitHub repository name for GitHub Pages.
export default defineConfig({
  base: '/geo-guesser/',
  plugins: [react()],
  build: {
    // Keep flags as separate files (fetched on demand) instead of inlining ~270 SVGs into the JS bundle.
    assetsInlineLimit: (file) => (file.includes('flag-icons') ? false : undefined),
    // The lazily loaded world-atlas chunk is ~760 KB (~245 KB gzipped) by design.
    chunkSizeWarningLimit: 800,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})

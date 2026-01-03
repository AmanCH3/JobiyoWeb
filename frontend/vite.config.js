// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      exclude: [],
      globals: {
        global: true,
        Buffer: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  // This 'test' block is the Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
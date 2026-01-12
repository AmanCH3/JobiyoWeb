// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

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
    https: {
      key: fs.readFileSync('E:/Cyber Security/JobiyoWeb/certs/localhost+2-key.pem'),
      cert: fs.readFileSync('E:/Cyber Security/JobiyoWeb/certs/localhost+2.pem'),
    },
    proxy: {
      '/api': {
        target: 'https://localhost:8000', 
        changeOrigin: true,
        secure: false, 
      },
      '/socket.io': {
        target: 'https://localhost:8000',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

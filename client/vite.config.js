import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: '.', // points to C:/fleettrack/client
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        require('@tailwindcss/postcss'),
        require('autoprefixer'),
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@engine': path.resolve(__dirname, 'src/cockpit/engine'),
      '@tests': path.resolve(__dirname, 'src/components/tests'),
      '@core': path.resolve(__dirname, 'src/core'), // optional: for shared logic
      '@utils': path.resolve(__dirname, 'src/utils'), // optional: for logging, helpers
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: path.resolve(__dirname, 'src/setupTests.js'),
    include: [
      'src/**/*.test.{js,ts,jsx,tsx}',
      'src/**/*.spec.{js,ts,jsx,tsx}',
    ],
    exclude: ['node_modules', 'dist'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['src/setupTests.js', 'src/**/*.stories.{js,jsx,ts,tsx}'],
    },
  },
});
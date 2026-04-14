import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    emptyOutDir: true,
    target: 'chrome120',
    rollupOptions: {
      input: {
        sidepanel: path.resolve(__dirname, 'sidepanel/index.html'),
        sandbox: path.resolve(__dirname, 'sandbox/index.html'),
      },
    },
  },
});

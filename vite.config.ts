import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    minify: 'esbuild', // fast and efficient minification (CO6)
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'] // splits vendor chunks for performance optimization (CO5)
        }
      }
    }
  }
});

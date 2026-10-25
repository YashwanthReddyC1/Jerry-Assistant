import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = `http://localhost:${env.PORT || 8788}`;
  return {
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': backendUrl }
  },
  build: { outDir: 'dist' },
  preview: {
    port: 5173,
    proxy: { '/api': backendUrl }
  }
  };
});

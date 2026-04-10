import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tp1/graphql': { target: 'http://localhost:8088', changeOrigin: true },
      '/tp1/graphql-ws': { target: 'ws://localhost:8088', ws: true, changeOrigin: true },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: command === 'serve' ? {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            Object.keys(req.headers).forEach((key) => {
              const value = req.headers[key];
              if (value !== undefined) {
                proxyReq.setHeader(key, value);
              }
            });
          });
        },
      },
    },
  } : {},
}));

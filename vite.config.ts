import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    },
    server: {
        host: '0.0.0.0', // para que acepte conexiones externas
        port: 3000,
        allowedHosts: ['.loca.lt', 'localhost'],
        https: false
      }
      
});

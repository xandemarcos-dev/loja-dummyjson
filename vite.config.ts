/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No GitHub Pages o site fica em https://<usuario>.github.io/<repo>/.
// O workflow de deploy define BASE_PATH a partir do nome do repositório;
// localmente usamos o mesmo valor padrão para que dev, preview e e2e se comportem igual à produção.
const base = process.env.BASE_PATH ?? '/loja-dummyjson/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Separa bibliotecas grandes em chunks próprios: melhor cache entre deploys.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mantine: ['@mantine/core', '@mantine/hooks', '@mantine/form', '@mantine/notifications'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

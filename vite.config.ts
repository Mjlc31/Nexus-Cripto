import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do sistema (Netlify env vars)
  // Used '.' instead of process.cwd() to avoid TypeScript error with 'cwd' property on Process
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Garante que o código frontend possa acessar process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill simples para evitar erros com outras libs que usam process.env
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});
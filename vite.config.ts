import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Use '.' to load env from current directory, preventing path issues
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Always replace with a string to avoid undefined injection errors
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ""),
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    const manualChunks = (id: string) => {
      if (!id.includes('node_modules')) {
        return undefined;
      }

      if (
        id.includes('react-dom') ||
        id.includes('react-router-dom') ||
        id.includes('react-router') ||
        id.includes('react-helmet-async') ||
        id.includes('/react/')
      ) {
        return 'react-vendor';
      }

      if (id.includes('@supabase/supabase-js')) {
        return 'supabase-vendor';
      }

      if (id.includes('firebase/')) {
        return 'firebase-vendor';
      }

      if (id.includes('react-datepicker') || id.includes('date-fns')) {
        return 'datepicker-vendor';
      }

      if (id.includes('lucide-react')) {
        return 'icon-vendor';
      }

      return undefined;
    };

    return {
      server: {
        port: 3001,
        host: '0.0.0.0',
      },
      plugins: [react()],
      ssr: {
        noExternal: ['react-helmet-async'],
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks,
          },
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

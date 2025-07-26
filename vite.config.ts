import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd(), '');
  const isVercel = !!env.VERCEL;

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      fs: {
        strict: false,
      },
    },
    // Use Vercel's URL structure if deployed on Vercel
    base: isVercel ? '/' : '/',
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
    define: {
      'process.env': { ...env, NODE_ENV: mode },
      // Support for Vercel's environment variables
      'import.meta.env.VITE_VERCEL': JSON.stringify(env.VERCEL || ''),
    },
  };
});

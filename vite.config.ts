import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss(),
      createHtmlPlugin({
        minify: isProduction,
        inject: {
          data: {
            base: isProduction ? '/crypto-wallet-monitor-frontend/' : '/',
          },
        },
      }),
    ],
    server: {
      // Enable strict filesystem access
      fs: {
        strict: false,
      },
      // Required for SPA fallback in development
      historyApiFallback: true,
    },
    // For production builds, this ensures the SPA fallback works when deployed
    base: isProduction ? '/crypto-wallet-monitor-frontend/' : '/',
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          // Ensure consistent hashes for better caching
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
    // Add this for better error handling in production
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
  };
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import spaFallback from "./vite.spa-fallback";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    spaFallback()
  ],
  server: {
    // Enable strict filesystem access
    fs: {
      strict: false,
    },
  },
  // For production builds, this ensures the SPA fallback works when deployed
  base: "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});

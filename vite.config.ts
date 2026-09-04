import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  // Windows often locks files mid-write (e.g. AI-generated PNGs landing in
  // public/). Polling avoids the fatal EBUSY crash from native fs.watch.
  server: {
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
});

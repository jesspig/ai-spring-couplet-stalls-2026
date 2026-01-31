import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/ai-spring-couplet-stalls-2026/',
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
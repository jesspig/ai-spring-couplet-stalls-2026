import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  // GitHub Pages 部署时使用仓库名路径，本地开发使用根路径
  base: mode === 'production' ? '/ai-spring-couplet-stalls-2026/' : '/',
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
}));
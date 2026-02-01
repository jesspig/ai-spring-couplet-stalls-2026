import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  // GitHub Pages 部署时使用仓库名路径，本地开发使用根路径
  base: mode === 'production' ? '/ai-spring-couplet-stalls-2026/' : '/',
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  // Yarn PnP 支持 - 使用 Vite 的内置支持，不需要手动配置 alias
  // Vite 会自动检测并使用 .pnp.cjs 进行模块解析
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
}));

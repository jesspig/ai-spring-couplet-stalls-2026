import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/v1": "http://localhost:3000",
      "/doc": "http://localhost:3000",
      "/swagger-ui": "http://localhost:3000",
      "/scalar": "http://localhost:3000",
      "/redoc": "http://localhost:3000"
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@pulso/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@pulso/types": path.resolve(__dirname, "../../packages/types/src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});

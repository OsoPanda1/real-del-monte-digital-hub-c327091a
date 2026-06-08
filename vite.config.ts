import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@geo-engine": path.resolve(__dirname, "./packages/geo-engine/src"),
      "@core-kernel": path.resolve(__dirname, "./packages/core-kernel/src"),
      "@data-models": path.resolve(__dirname, "./packages/data-models/src"),
      "@ui-kit": path.resolve(__dirname, "./packages/ui-kit/src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          three:           ["three"],
          r3f:             ["@react-three/fiber", "@react-three/drei"],
          postprocessing:  ["@react-three/postprocessing", "postprocessing"],
          react:           ["react", "react-dom"],
          lenis:           ["lenis"],
          zustand:         ["zustand"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  assetsInclude: ["**/*.glb", "**/*.hdr"],
  server: { port: 5173 },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          three:  ["three", "@react-three/fiber", "@react-three/drei"],
          react:  ["react", "react-dom"],
          lenis:  ["lenis"],
        },
      },
    },
  },
  assetsInclude: ["**/*.glb", "**/*.hdr"],
  server: { port: 5173 },
});

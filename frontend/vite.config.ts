import { defineConfig } from "vite";

// HACS does not build anything: the bundle in custom_components is what users
// get, so it is written straight into the integration folder and committed.
export default defineConfig({
  build: {
    outDir: "../custom_components/leasing_km/frontend",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: false,
    lib: {
      entry: "src/leasing-km-card.ts",
      formats: ["es"],
      fileName: () => "leasing-km-card.js",
    },
    rollupOptions: {
      // Stable names: the bundle is committed, so hashes would only churn the
      // diff and leave stale files behind.
      output: { chunkFileNames: "[name].js" },
    },
  },
});

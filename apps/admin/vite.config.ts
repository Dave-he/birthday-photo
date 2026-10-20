import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Split the vendor code into stable, cacheable chunks.
 *
 * The admin panel bundles Refine + Ant Design + React, which easily exceeds
 * 2 MB in a single chunk. Splitting them keeps the app shell small and lets
 * the browser cache the heavy framework bundles independently of the app code.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (id.includes("@refinedev")) return "refine";
          if (
            id.includes("antd") ||
            id.includes("@ant-design") ||
            id.includes("@rc-component") ||
            id.includes("/rc-")
          ) {
            return "antd";
          }
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("/react-dom/") || id.includes("/react/") || id.includes("/scheduler/")) {
            return "react";
          }

          return "vendor";
        },
      },
    },
  },
});

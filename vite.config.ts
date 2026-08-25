import path from "node:path";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), tailwindcss(), tanstackStart(), react()],
  resolve: {
    alias: {
      "entities/lib/decode.js": path.resolve(
        import.meta.dirname,
        "node_modules/entities/lib/decode.js",
      ),
      "entities/lib/encode.js": path.resolve(
        import.meta.dirname,
        "node_modules/entities/lib/encode.js",
      ),
      entities: path.resolve(import.meta.dirname, "node_modules/entities"),
    },
  },
  nitro: { preset: "node-server" },
});

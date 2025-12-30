import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));
const appVersion = packageJson.version || "0.0.1";

// Plugin to inject version into HTML
const injectVersionPlugin = () => {
  return {
    name: "inject-version",
    transformIndexHtml(html) {
      return html.replace(
        /<title>.*?<\/title>/,
        `<title>Coca Tet v${appVersion}</title>`
      );
    },
  };
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    injectVersionPlugin(), // Inject version into HTML
    electron([
      {
        entry: "electron/main.js",
      },
    ]),
    renderer(),
  ],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: "esbuild",
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "antd-vendor": ["antd"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: "localhost",
    strictPort: false,
  },
});

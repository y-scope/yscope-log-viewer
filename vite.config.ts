import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";


// https://vite.dev/config/
export default defineConfig({
    // With default appType "spa", non-existent paths like /test/non-exist.clp.zst will be
    // redirected to /index.html instead of returning 404.
    appType: "mpa",

    // If not specified, after build, the log viewer can only be served at a website's root.
    base: "./",
    build: {
        assetsDir: "",
        rollupOptions: {
            output: {
                manualChunks: {
                    "monaco-editor": ["monaco-editor"],
                },
            },
        },
        sourcemap: true,
    },
    optimizeDeps: {
        exclude: ["clp-ffi-js/worker"],
    },
    plugins: [react()],
    server: {
        port: 3010,
    },
});

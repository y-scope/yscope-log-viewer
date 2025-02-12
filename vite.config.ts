import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";


// https://vite.dev/config/
export default defineConfig({
    appType: "mpa",
    base: "./",
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    "monaco-editor": ["monaco-editor"],
                },
            },
        },
    },
    optimizeDeps: {
        exclude: [
            "clp-ffi-js/worker",
        ],
    },
    plugins: [
        react(),
    ],
    server: {
        port: 3010,
    },
});

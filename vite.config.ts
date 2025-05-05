import react from "@vitejs/plugin-react-swc";
import {defineConfig} from "vite";


// https://vite.dev/config/
export default defineConfig({
    // We use "mpa" since with "spa" (the default), non-existent paths like /test/non-exist.clp.zst
    // will be redirected to /index.html instead of returning 404.
    appType: "mpa",

    // If not specified, after build, the log viewer can only be served at a website's root.
    base: "./",
    build: {
        assetsDir: "",
        rollupOptions: {
            output: {
                // Define manual chunks to optimize code splitting for better caching and
                // performance.
                manualChunks: {
                    "monaco-editor": ["monaco-editor"],
                },
            },
        },
        sourcemap: true,
    },
    optimizeDeps: {
        // Exclude the worker or else `ClpFfiJs-worker.wasm` won't be found when served from the
        // debug server (this option only affects debug builds).
        exclude: ["clp-ffi-js/worker"],
    },
    plugins: [react()],
    server: {
        port: 3010,
    },
});

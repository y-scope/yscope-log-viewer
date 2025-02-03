import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";


// https://vite.dev/config/
export default defineConfig({
    appType: "mpa",
    build: {
        rollupOptions: {
            external: [
                /monaco-editor\/esm\/vs\/basic-languages/,
                /monaco-editor\/esm\/vs\/editor\/browser\/widget/,
                /monaco-editor\/esm\/vs\/editor\/contrib/,
                /monaco-editor\/esm\/vs\/language/,
            ],
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

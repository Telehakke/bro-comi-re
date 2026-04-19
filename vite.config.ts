import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        babel({ presets: [reactCompilerPreset()] }),
        tailwindcss(),
    ],
    build: {
        outDir: "docs",
        rolldownOptions: {
            output: {
                codeSplitting: {
                    minSize: 20000,
                    groups: [
                        {
                            name: "vendor",
                            test: /node_modules/,
                        },
                    ],
                },
            },
        },
    },
    server: {
        host: true,
    },
    base: "/bro-comi-re",
});

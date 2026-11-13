import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 5173,
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        css: false,
        // `forks` lanza procesos hijos con tuberías; en entornos Windows
        // restringidos (sandbox de agentes, políticas de escritorio) eso falla
        // con EPERM. Los hilos de trabajo no necesitan procesos externos.
        pool: 'threads',
        fileParallelism: false,
    },
});

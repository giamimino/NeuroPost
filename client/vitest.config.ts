import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/tests/**/*.test.ts', 'src/tests/**/*.test.tsx'],
    setupFiles: "./src/tests/setup.ts",
  },
})
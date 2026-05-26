import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    // E2E specs live in `tests/` (Playwright); `datagouv-components` has its own tooling.
    exclude: ['**/node_modules/**', '**/.nuxt/**', '**/.output/**', 'tests/**', 'datagouv-components/**'],
  },
})

import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // The real package entry pulls every component (leaflet, chart.js, pdfjs…).
      // Unit tests only need a few pure functions, re-exported by the shim from
      // their real source modules.
      '@datagouv/components-next': fileURLToPath(new URL('./tests-unit/shims/datagouv-components.ts', import.meta.url)),
      '~': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  // Nuxt injects these flags at build time; under vitest we run the server side of
  // the universal code, which is the only side able to read HttpOnly cookies.
  define: {
    'import.meta.server': 'true',
    'import.meta.client': 'false',
  },
  test: {
    include: ['tests-unit/**/*.spec.ts'],
    environment: 'node',
    setupFiles: ['./tests-unit/setup.ts'],
  },
})

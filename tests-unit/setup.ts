import { computed, readonly, ref, toRef, toValue, watch } from 'vue'
import { useTranslation } from '~/datagouv-components/src/composables/useTranslation'

// Nuxt auto-imports are not available under vitest: expose the Vue ones and the
// self-contained `useTranslation` as globals so the tested modules can evaluate
// and run. Nuxt-only globals (useRoute, useNuxtApp…) are stubbed per-test with
// `vi.stubGlobal` where needed.
Object.assign(globalThis, { computed, readonly, ref, toRef, toValue, watch, useTranslation })

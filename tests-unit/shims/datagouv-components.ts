// Vitest alias target for '@datagouv/components-next' (see vitest.config.ts).
// Re-exports only what the tested cdata modules import at runtime, from the
// real source files, so tests run the real implementations without loading the
// whole package entry (components, leaflet, chart.js…).
export { accessTypeToApi, accessTypeToForm, defaultAccessTypeForm } from '~/datagouv-components/src/types/access_types'
export { throwOnNever } from '~/datagouv-components/src/functions/never'
export { DESCRIPTION_MIN_LENGTH } from '~/datagouv-components/src/functions/description'
export { getResourceFilesize } from '~/datagouv-components/src/functions/resources'

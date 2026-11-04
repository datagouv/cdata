<template>
  <div
    v-if="hasError"
    class="bg-warning-lightest text-warning-dark p-3 mb-4"
  >
    <p class="fr-grid-row fr-m-0">
      <span
        class="fr-icon-warning-line"
        aria-hidden="true"
      />
      {{ t("La structure de données de ce fichier n'a pas pu être chargée.") }}
    </p>
  </div>
  <PreviewLoader v-else-if="loading" />
  <DataStructureGrid
    v-else
    :columns
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Resource } from '../../types/resources'
import { useTranslation } from '../../composables/useTranslation'
import { injectTabularProfile } from '../../composables/useTabularProfile'
import DataStructureGrid from './DataStructureGrid.vue'
import PreviewLoader from './PreviewLoader.vue'

const props = defineProps<{ resource: Resource }>()
const { t } = useTranslation()

// Profile is shared with sibling components (e.g. TabularExplorer) via
// `provideTabularProfile` in the parent. Falls back to a local fetch
// when no parent provides it (standalone usage).
const { data: profileData, status } = await injectTabularProfile(() => props.resource.id)

const loading = computed(() => status.value === 'idle' || status.value === 'pending')
const hasError = computed(() => status.value === 'error')
const columns = computed(() => Object.entries(profileData.value?.profile?.columns ?? {})
  .map(([name, info]) => ({ name, format: info?.format })))
</script>

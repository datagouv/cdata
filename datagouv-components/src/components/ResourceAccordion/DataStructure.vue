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
  <div
    v-else
    class="fr-grid-row fr-grid-row--gutters"
  >
    <div
      v-if="!hasColumnInfo"
      class="bg-warning-lightest text-warning-dark p-3 mb-4"
    >
      <p class="fr-grid-row fr-m-0">
        <span
          class="fr-icon-warning-line"
          aria-hidden="true"
        />
        {{ t("Aucune structure de données détectée pour ce fichier.") }}
      </p>
    </div>
    <template v-if="hasColumnInfo">
      <div
        v-for="(column, index) in columns"
        :key="index"
        class="fr-col-12 fr-col-sm-6 fr-col-md-4 fr-col-lg-3"
      >
        <h5 class="fr-text--sm fr-text--bold fr-mt-0 fr-mb-1v">
          {{ column }}
        </h5>
        <code
          v-if="columnsInfo[column]"
          class="code"
        >
          {{ columnsInfo[column].format }}
        </code>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Resource } from '../../types/resources'
import { useTranslation } from '../../composables/useTranslation'
import { injectTabularProfile } from '../../composables/useTabularProfile'
import PreviewLoader from './PreviewLoader.vue'

const props = defineProps<{ resource: Resource }>()
const { t } = useTranslation()

// Profile is shared with sibling components (e.g. TabularExplorer) via
// `provideTabularProfile` in the parent. Falls back to a local fetch
// when no parent provides it (standalone usage).
const { data: profileData, status } = injectTabularProfile(() => props.resource.id)

const loading = computed(() => status.value === 'idle' || status.value === 'pending')
const hasError = computed(() => status.value === 'error')
const hasColumnInfo = computed(() => !!profileData.value?.profile?.columns)
const columns = computed(() => profileData.value?.profile ? Object.keys(profileData.value.profile.columns) : [])
const columnsInfo = computed(() => profileData.value?.profile?.columns ?? {})
</script>

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
    class="min-w-0"
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
    <div
      v-if="hasColumnInfo"
      class="overflow-x-auto rounded border border-gray-default"
    >
      <table class="w-full border-collapse text-left text-sm/5">
        <caption class="sr-only">
          {{ t('Structure des données du fichier') }}
        </caption>
        <thead class="bg-gray-some text-gray-secondary">
          <tr>
            <th
              scope="col"
              class="px-4 py-3 font-medium"
            >
              {{ t('Colonne') }}
            </th>
            <th
              scope="col"
              class="px-4 py-3 font-medium"
            >
              {{ t('Format') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-default">
          <tr
            v-for="(column, index) in columns"
            :key="index"
          >
            <th
              scope="row"
              class="px-4 py-3 font-normal text-gray-title"
            >
              {{ column }}
            </th>
            <td class="px-4 py-3">
              <code
                v-if="columnsInfo[column]"
                class="font-mono text-[13px]/[18px] text-gray-title"
              >
                {{ columnsInfo[column].format }}
              </code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
const { data: profileData, status } = await injectTabularProfile(() => props.resource.id)

const loading = computed(() => status.value === 'idle' || status.value === 'pending')
const hasError = computed(() => status.value === 'error')
const hasColumnInfo = computed(() => !!profileData.value?.profile?.columns)
const columns = computed(() => profileData.value?.profile ? Object.keys(profileData.value.profile.columns) : [])
const columnsInfo = computed(() => profileData.value?.profile?.columns ?? {})
</script>

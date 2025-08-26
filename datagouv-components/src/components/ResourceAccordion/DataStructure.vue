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
      {{ $t("La structure de données de ce fichier n'a pas pu être chargée.") }}
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
        {{ $t("Aucune structure de données détectée pour ce fichier.") }}
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
        <code class="code">
          {{ columnsInfo[column].format }}
        </code>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Resource } from '../../types/resources'
import { useGetProfile } from '../../functions/tabularApi'
import PreviewLoader from './PreviewLoader.vue'

const props = defineProps<{ resource: Resource }>()
const getProfile = useGetProfile()

type ColumnInfo = {
  score: number
  format: string
  python_type: string
}

const columns = ref<Array<string>>([])
const columnsInfo = ref<Record<string, ColumnInfo>>({})
const loading = ref(true)
const hasError = ref(false)
const hasColumnInfo = ref(false)

onMounted(async () => {
  try {
    const response = await getProfile(props.resource.id) // Assurez-vous que cette fonction retourne bien les données attendues
    if ('profile' in response && response.profile) {
      columns.value = Object.keys(response.profile.columns)
      columnsInfo.value = response.profile.columns
      hasColumnInfo.value = true
      loading.value = false
    }
    else {
      hasError.value = true
      loading.value = false
    }
  }
  catch {
    hasError.value = true
    loading.value = false
  }
})
</script>

<template>
  <div class="fr-text--xs">
    <div v-if="dataFairEmbedUrl">
      <iframe
        :src="dataFairEmbedUrl"
        width="100%"
        height="500px"
        style="background-color: transparent;
          border: none;"
      />
    </div>
    <PreviewUnavailable v-else>
      {{ t("L'aperçu de ce fichier n'a pas pu être chargé. Téléchargez-le depuis l'onglet Téléchargements.") }}
    </PreviewUnavailable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PreviewUnavailable from './PreviewUnavailable.vue'
import type { Resource } from '../../types/resources'
import type { Dataset, DatasetV2 } from '../../types/datasets'
import { useTranslation } from '../../composables/useTranslation'

const props = defineProps<{
  resource: Resource
  dataset: Dataset | DatasetV2
}>()

const { t } = useTranslation()

const datafairOrigin = computed(() => {
  return props.resource.extras['datafairOrigin'] || props.dataset.extras['datafairOrigin']
})
const datafairDatasetId = computed(() => {
  return props.resource.extras['datafairDatasetId'] || props.dataset.extras['datafairDatasetId']
})
const embed = computed(() => props.resource.extras['datafairEmbed'])

const dataFairEmbedUrl = computed(() => {
  // if the return value is null, a banner error is shown
  if (!datafairOrigin.value || !datafairDatasetId.value)
    return null
  return `${datafairOrigin.value}/embed/dataset/${datafairDatasetId.value}/${embed.value}`
})
</script>

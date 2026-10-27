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
    <PreviewError
      v-else
      :resource="resource"
      :error-type="errorType"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PreviewError from './PreviewError.vue'
import type { Resource } from '../../types/resources'
import type { Dataset, DatasetV2 } from '../../types/datasets'
import { getTransientErrorType } from '../../functions/previewErrors'

const props = defineProps<{
  resource: Resource
  dataset: Dataset | DatasetV2
}>()

const errorType = computed(() => getTransientErrorType(props.resource))

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

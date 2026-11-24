<template>
  <MetadataSection :title="t('Intégrer sur votre site')">
    <CodeBlock
      :code="embedHtml"
      language="HTML"
      :label="t('Copier le code embarqué')"
      :copied-label="t('Code embarqué copié !')"
    />
  </MetadataSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../composables/useTranslation'
import { getDatasetOEmbedHtml } from '../../functions/datasets'
import type { Dataset, DatasetV2, DatasetV2WithFullObject } from '../../types/datasets'
import CodeBlock from '../CodeBlock.vue'
import MetadataSection from './MetadataSection.vue'

const props = defineProps<{
  dataset: Dataset | DatasetV2 | DatasetV2WithFullObject
}>()

const { t } = useTranslation()
const embedHtml = computed(() => getDatasetOEmbedHtml('dataset', props.dataset.id))
</script>

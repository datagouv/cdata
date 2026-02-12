<template>
  <div class="space-y-1 py-6">
    <div class="flex items-center space-x-2 mb-1">
      <h3 class="mb-0 uppercase text-gray-plain text-sm font-bold">
        {{ t('Intégrer sur votre site') }}
      </h3>
      <CopyButton
        :hide-label="true"
        :label="t('Copier le code embarqué')"
        :copied-label="t('Code embarqué copié !')"
        :text="embedHtml"
      />
    </div>
    <textarea
      ref="textAreaRef"
      class="bg-gray-lower text-gray-medium rounded font-mono text-sm px-1 py-[2px] w-full border resize-none"
      :value="embedHtml"
      readonly="true"
      @click="selectContent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslation } from '../../composables/useTranslation'
import { getDatasetOEmbedHtml } from '../../functions/datasets'
import type { Dataset, DatasetV2, DatasetV2WithFullObject } from '../../types/datasets'
import CopyButton from '../CopyButton.vue'

const props = defineProps<{
  dataset: Dataset | DatasetV2 | DatasetV2WithFullObject
}>()

const { t } = useTranslation()
const textAreaRef = ref<HTMLTextAreaElement | null>(null)

const embedHtml = computed(() => getDatasetOEmbedHtml('dataset', props.dataset.id))

function selectContent(e: Event) {
  (e.target as HTMLTextAreaElement).select()
}
</script>

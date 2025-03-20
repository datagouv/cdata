<template>
  <fieldset
    class="fr-fieldset"
    aria-labelledby="datasets-legend"
  >
    <legend
      id="datasets-legend"
      class="fr-fieldset__legend"
    >
      <h2 class="text-sm font-bold uppercase mb-3">
        {{ label }}
      </h2>
    </legend>
    <div
      v-if="selectedDatasets.length"
      ref="sortableRoot"
      class="w-full mb-8"
    >
      <div
        v-for="(dataset, index) in selectedDatasets"
        :key="dataset.id"
        class="flex items-center space-x-2"
      >
        <div
          v-if="! single"
          class="shrink-0"
        >
          <BrandedButton
            color="primary-softer"
            :title="t('Drag to move this content')"
            :icon="RiDraggable"
            size="lg"
            keep-margins-even-without-borders
          />
        </div>
        <CardLg
          class="flex-1"
          :dataset
        />
        <div class="shrink-0">
          <BrandedButton
            color="primary-softer"
            :title="t('Remove the dataset')"
            :icon="RiDeleteBinLine"
            size="lg"
            keep-margins-even-without-borders
            @click="removeDataset(index)"
          />
        </div>
      </div>
    </div>

    <div
      v-if="!selectedDatasetsSuggest.length || !single"
      class="fr-fieldset__element"
    >
      <SearchableSelect
        v-model="selectedDatasetsSuggest"
        :label="$t('Look for a dataset')"
        :placeholder="$t('Search a dataset…')"
        class="mb-6"
        :suggest="suggestDataset"
        :multiple="true"
      >
        <template #option="{ option: dataset }">
          <div class="flex items-center space-x-2">
            <NuxtImg
              :src="dataset.image_url"
              alt=""
              loading="lazy"
              class="size-5 rounded-full"
            />
            <span>{{ dataset.title }}</span>
          </div>
        </template>
      </SearchableSelect>
      <p class="fr-hr-or w-full text-transform-lowercase fr-text--regular">
        <span class="fr-hr-or-text">{{ t('or') }}</span>
      </p>
      <form
        class="flex items-end space-x-4"
        @submit.prevent="loadDatasetByLink"
      >
        <InputGroup
          v-model="datasetUrl"
          :label="t('Link to the dataset')"
          :placeholder="'https://...'"
          :has-error="!!datasetUrlError"
          :error-text="datasetUrlError"
          class="w-full !mb-0"
        />
        <BrandedButton
          type="submit"
          :icon="RiAddLine"
          size="sm"
          :title="t('Add dataset')"
        />
      </form>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import type { Dataset, DatasetV2 } from '@datagouv/components-next'
import { RiAddLine, RiDeleteBinLine, RiDraggable } from '@remixicon/vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import CardLg from '~/components/dataset/card-lg.vue'
import SearchableSelect from '~/components/SearchableSelect.vue'
import type { DatasetSuggest } from '~/types/types'

const props = withDefaults(defineProps<{
  single?: boolean
  label?: string
}>(), {
  single: false,
})

const sortableRootRef = useTemplateRef('sortableRoot')
const datasetsById = ref<Record<string, Dataset | DatasetV2>>({})

const selectedDatasetsSuggest = defineModel<Array<Dataset | DatasetV2 | DatasetSuggest>>({ required: true })
const datasetUrl = ref('')
const datasetUrlError = ref<string | null>(null)
useSortable(sortableRootRef, selectedDatasetsSuggest)

const { t } = useI18n()
const { $api } = useNuxtApp()

const label = computed(() => props.label || t('Associated datasets'))

const suggestDataset = async (query: string): Promise<Array<DatasetSuggest>> => {
  return await $api<Array<DatasetSuggest>>('/api/1/datasets/suggest/', {
    query: {
      q: query,
      size: 5,
    },
  })
}

watchEffect(async () => {
  for (const dataset of selectedDatasetsSuggest.value) {
    if (dataset.id in datasetsById.value) continue
    if ('resources' in dataset) {
      // It's already a full dataset
      datasetsById.value[dataset.id] = dataset
    }
    else {
      datasetsById.value[dataset.id] = await $api<DatasetV2>(`/api/2/datasets/${dataset.id}/`)
    }
  }
})

const selectedDatasets = computed<Array<Dataset | DatasetV2 | DatasetSuggest>>(() => {
  return selectedDatasetsSuggest.value.map((datasetSuggest) => {
    return datasetsById.value[datasetSuggest.id] || null
  }).filter(dataset => dataset)
})

const loadDatasetByLink = async () => {
  const matches = /\/datasets\/(.+?)\/?$/.exec(datasetUrl.value)
  if (!matches) {
    datasetUrlError.value = t(`The provided URL doesn't look like a datasets URL.`)
    return
  }
  const id = matches[1]
  try {
    const dataset = await $api<DatasetV2>(`/api/2/datasets/${id}/`)
    if (selectedDatasetsSuggest.value.find(suggest => suggest.id === dataset.id)) {
      datasetUrlError.value = t('The dataset is already present in the list.')
      return
    }

    datasetsById.value[dataset.id] = dataset
    selectedDatasetsSuggest.value.push(dataset)
    datasetUrlError.value = null
    datasetUrl.value = ''
  }
  catch {
    datasetUrlError.value = t('Cannot find a dataset identified by {id}.', { id })
  }
}

function removeDataset(index: number) {
  selectedDatasetsSuggest.value.splice(index, 1)
};
</script>

<template>
  <ModalWithButton
    v-model="isOpen"
    :title="titles[type]"
    size="lg"
  >
    <DatasetsSelect
      v-if="type === 'dataset'"
      v-model="selectedDatasets"
    />
    <DataservicesSelect
      v-else-if="type === 'dataservice'"
      v-model="selectedDataservices"
    />
    <ReusesSelect
      v-else
      v-model="selectedReuses"
    />
    <template #footer>
      <div class="flex-1 flex justify-end">
        <BrandedButton
          :loading
          @click="validate"
        >
          {{ $t('Valider') }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { BrandedButton } from '@datagouv/components-next'
import type { Dataservice, Dataset, DatasetV2, Reuse } from '@datagouv/components-next'
import type { DatasetBloc, DataserviceBloc, ObjectBloc, ReuseBloc } from '~/types/pages'
import type { DatasetSuggest } from '~/types/types'
import type { ObjectType } from '~/utils/pages'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps<{
  type: ObjectType
}>()

const isOpen = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  select: [Array<ObjectBloc>]
}>()

const { $api } = useNuxtApp()
const { t } = useTranslation()

const titles = computed(() => ({
  dataset: t('Sélectionner des jeux de données'),
  dataservice: t('Sélectionner des API'),
  reuse: t('Sélectionner des réutilisations'),
}))

const selectedDatasets = ref<Array<Dataset | DatasetV2 | DatasetSuggest>>([])
const selectedDataservices = ref<Array<Dataservice>>([])
const selectedReuses = ref<Array<Reuse>>([])
const loading = ref(false)

watch(isOpen, (open) => {
  if (!open) return
  selectedDatasets.value = []
  selectedDataservices.value = []
  selectedReuses.value = []
})

// The selectors return search suggestions typed as full objects: the cards need the real ones.
function isFullReuse(reuse: Reuse): boolean {
  return 'datasets' in reuse
}

async function buildBlocs(): Promise<Array<ObjectBloc>> {
  if (props.type === 'dataset') {
    const datasets = await Promise.all(selectedDatasets.value.map(dataset =>
      'harvest' in dataset || 'metrics' in dataset
        ? dataset as DatasetV2
        : $api<DatasetV2>(`/api/2/datasets/${dataset.id}/`),
    ))
    return datasets.map((dataset): DatasetBloc => ({ class: 'DatasetBloc', id: uuidv4(), dataset }))
  }
  if (props.type === 'reuse') {
    const reuses = await Promise.all(selectedReuses.value.map(reuse =>
      isFullReuse(reuse) ? reuse : $api<Reuse>(`/api/1/reuses/${reuse.id}/`),
    ))
    return reuses.map((reuse): ReuseBloc => ({ class: 'ReuseBloc', id: uuidv4(), reuse }))
  }
  return selectedDataservices.value.map((dataservice): DataserviceBloc => ({ class: 'DataserviceBloc', id: uuidv4(), dataservice }))
}

async function validate() {
  loading.value = true
  try {
    emit('select', await buildBlocs())
    isOpen.value = false
  }
  catch {
    toast.error(t('Erreur lors du chargement des éléments sélectionnés'))
  }
  finally {
    loading.value = false
  }
}
</script>

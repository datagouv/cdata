<template>
  <ModalWithButton
    v-model="isOpen"
    :title="titles[type]"
    size="lg"
  >
    <DatasetsSelect
      v-if="type === 'DatasetBloc'"
      v-model="selectedDatasets"
    />
    <DataservicesSelect
      v-else-if="type === 'DataserviceBloc'"
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
import { v4 as uuidv4 } from 'uuid'
import { OBJECT_WIDTH } from '~/utils/pages'

const props = defineProps<{
  type: ObjectBloc['class']
}>()

const isOpen = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  select: [Array<ObjectBloc>]
}>()

const { $api } = useNuxtApp()
const { t } = useTranslation()

const titles = computed<Record<ObjectBloc['class'], string>>(() => ({
  DatasetBloc: t('Sélectionner des jeux de données'),
  DataserviceBloc: t('Sélectionner des API'),
  ReuseBloc: t('Sélectionner des réutilisations'),
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
async function buildBlocs(): Promise<Array<ObjectBloc>> {
  if (props.type === 'DatasetBloc') {
    const datasets = await Promise.all(selectedDatasets.value.map(dataset =>
      'harvest' in dataset || 'metrics' in dataset
        ? dataset as DatasetV2
        : $api<DatasetV2>(`/api/2/datasets/${dataset.id}/`),
    ))
    return datasets.map((dataset): DatasetBloc => ({ class: 'DatasetBloc', id: uuidv4(), width: OBJECT_WIDTH.DatasetBloc, dataset }))
  }
  if (props.type === 'ReuseBloc') {
    const reuses = await Promise.all(selectedReuses.value.map(reuse =>
      // Not `in`: it would narrow the suggestions out, typed as they are as `Reuse`.
      Object.hasOwn(reuse, 'datasets') ? reuse : $api<Reuse>(`/api/1/reuses/${reuse.id}/`),
    ))
    return reuses.map((reuse): ReuseBloc => ({ class: 'ReuseBloc', id: uuidv4(), width: OBJECT_WIDTH.ReuseBloc, reuse }))
  }
  return selectedDataservices.value.map((dataservice): DataserviceBloc => ({ class: 'DataserviceBloc', id: uuidv4(), width: OBJECT_WIDTH.DataserviceBloc, dataservice }))
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

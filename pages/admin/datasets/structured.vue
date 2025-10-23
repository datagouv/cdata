<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem
        to="/"
        external
      >
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/datasets">
        {{ $t('Jeux de données') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Publication structurée') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <Stepper
      :steps
      :current-step="currentStepNumber"
    />

    <Step1AssociateSchema
      v-if="currentStep === 1"
      @next="moveToStep(2)"
    />
    <Step2LoadData
      v-if="currentStep === 2"
      v-model:resources="resources"
      v-model:use-spreadsheet="useSpreadsheet"
      v-model:schema-fields="schemaFields"
      :loading
      @previous="moveToStep(1)"
      @next="dataNext"
    />
    <Step2Sheet
      v-if="currentStep === '2-sheet'"
      @previous="moveToStep(2)"
      @next="sheetNext"
    />
    <Step3DescribeDataset
      v-if="currentStep === 3"
      @previous="goBackFromStep3"
      @next="describeNext"
    />
    <Step4CompletePublication
      v-if="currentStep === 4 && newDataset"
      :dataset="newDataset"
      :loading
      @next="updateDataset"
    />
    <div class="h-64" />
  </div>
</template>

<script setup lang="ts">
import type { Dataset, Frequency, Owned, Resource } from '@datagouv/components-next'
import Step1AssociateSchema from '~/components/Datasets/Structured/Step1AssociateSchema.vue'
import Step2LoadData from '~/components/Datasets/Structured/Step2LoadData.vue'
import Step2Sheet from '~/components/Datasets/Structured/Step2Sheet.vue'
import Step3DescribeDataset from '~/components/Datasets/Structured/Step3DescribeDataset.vue'
import Step4CompletePublication from '~/components/Datasets/New/Step4CompletePublication.vue'
import Stepper from '~/components/Stepper/Stepper.vue'
import type { DatasetForm, EnrichedLicense, ResourceForm, SpatialGranularity, SpatialZone, Tag } from '~/types/types'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { t } = useTranslation()
const config = useRuntimeConfig()
const route = useRoute()
const { $api } = useNuxtApp()

const DATASET_FORM_STATE = 'structured-dataset-form'
const DATASET_FILES_STATE = 'structured-dataset-files'
const LOADING_STATE = 'structured-dataset-loading'
const USE_SPREADSHEET_STATE = 'structured-use-spreadsheet'
const SCHEMA_FIELDS_STATE = 'structured-schema-fields'

const steps = computed(() => ([
  t('Associez un schéma'),
  t('Chargez vos données'),
  t('Décrivez votre jeu de données'),
  t('Finalisez la publication'),
]))

const loading = useState(LOADING_STATE, () => false)
const useSpreadsheet = useState(USE_SPREADSHEET_STATE, () => false)
const schemaFields = useState<string[]>(SCHEMA_FIELDS_STATE, () => [])

const datasetForm = useState(DATASET_FORM_STATE, () => ({
  title: '',
  acronym: '',
  description: '',
  owned: null as Owned | null,
  tags: [] as Array<Tag>,
  license: null as EnrichedLicense | null,
  temporal_coverage: { start: null, end: null },
  frequency: null as Frequency | null,
  spatial_zones: [] as Array<SpatialZone>,
  spatial_granularity: null as SpatialGranularity | null,
  contact_points: [],
  private: true,
  featured: false,
} as DatasetForm))

const resources = useState<Array<ResourceForm>>(DATASET_FILES_STATE, () => [])
const newDataset = useState<Dataset | null>('structured-new-dataset', () => null)
const publicationMode = useState<'new' | 'existing'>('structured-publication-mode', () => 'new')
const existingDataset = useState<Dataset | null>('structured-existing-dataset', () => null)

const currentStep = computed(() => {
  const step = route.query.step as string
  if (step === '2-sheet') return '2-sheet'
  return parseInt(step) || 1
})

const currentStepNumber = computed(() => {
  const step = currentStep.value
  if (step === '2-sheet') return 2
  return step as number
})

const isCurrentStepValid = computed(() => {
  const step = currentStep.value

  // Cas spécial pour l'étape tableur
  if (step === '2-sheet') return true

  if (typeof step === 'number') {
    if (step < 1) return false
    if (step > steps.value.length) return false
    // Step 3 est le formulaire de description, on ne vérifie pas le title ici
    // car c'est justement là qu'on le remplit
    if (step === 4 && !newDataset.value) return false
  }

  return true
})

const moveToStep = (step: number) => {
  return navigateTo({ path: route.path, query: { ...route.query, step } })
}

const dataNext = () => {
  if (publicationMode.value === 'existing') {
    save()
  }
  else {
    moveToStep(3)
  }
}

const sheetNext = () => {
  if (publicationMode.value === 'existing') {
    save()
  }
  else {
    moveToStep(3)
  }
}

const goBackFromStep3 = () => {
  // Si on a utilisé le tableur, retourner à l'écran tableur
  if (useSpreadsheet.value) {
    navigateTo({ path: route.path, query: { ...route.query, step: '2-sheet' } })
  }
  else {
    moveToStep(2)
  }
}

const describeNext = () => {
  save()
}

async function save() {
  try {
    loading.value = true

    let dataset: Dataset

    if (publicationMode.value === 'existing' && existingDataset.value) {
      dataset = existingDataset.value
      newDataset.value = dataset
    }
    else {
      if (
        datasetForm.value.contact_points
        && datasetForm.value.owned?.organization
      ) {
        for (const contactPointKey in datasetForm.value.contact_points) {
          if (datasetForm.value.contact_points[contactPointKey] && !('id' in datasetForm.value.contact_points[contactPointKey])) {
            datasetForm.value.contact_points[contactPointKey] = await newContactPoint($api, datasetForm.value.owned?.organization, datasetForm.value.contact_points[contactPointKey])
          }
        }
      }

      dataset = newDataset.value = newDataset.value || await $api<Dataset>('/api/1/datasets/', {
        method: 'POST',
        body: JSON.stringify(datasetToApi(datasetForm.value, { private: true })),
      })
    }

    let results: Array<PromiseSettledResult<Resource>> = []
    for (const chunk of chunkArray(resources.value, config.public.maxNumberOfResourcesToUploadInParallel)) {
      results = [...results, ...await Promise.allSettled(chunk.map(resource => saveResourceForm(dataset, resource)))]
    }

    if (results.every(f => f.status !== 'rejected')) {
      if (publicationMode.value === 'existing') {
        await navigateTo(`/datasets/${dataset.slug}`)
      }
      else {
        await moveToStep(4)
      }
      clearNuxtState(DATASET_FORM_STATE)
      clearNuxtState(DATASET_FILES_STATE)
    }
  }
  finally {
    loading.value = false
    clearNuxtState(LOADING_STATE)
  }
}

async function updateDataset(asPrivate: boolean) {
  if (!newDataset.value) {
    return moveToStep(3)
  }
  if (!asPrivate) {
    loading.value = true
    try {
      newDataset.value.private = false
      await $api<Dataset>(`/api/1/datasets/${newDataset.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(newDataset.value),
      })
    }
    finally {
      loading.value = false
    }
  }

  await navigateTo(`/datasets/${newDataset.value.slug}`)
}

watchEffect(() => {
  if (!isCurrentStepValid.value) {
    moveToStep(1)
  }
})
</script>

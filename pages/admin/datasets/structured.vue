<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/">
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
      v-model="associateSchemaForm"
      v-model:publication-mode="publicationMode"
      @next="moveToStep(2)"
    />
    <Step2LoadData
      v-if="currentStep === 2"
      v-model:resources="resources"
      v-model:use-spreadsheet="useSpreadsheet"
      :schema="associateSchemaForm.selectedSchema"
      :publication-mode="publicationMode"
      @previous="moveToStep(1)"
      @next="dataNext"
      @open-sheet="openSheet"
    />
    <Step2Sheet
      v-if="currentStep === '2-sheet'"
      v-model="file"
      v-model:resources="resources"
      :schema="associateSchemaForm.selectedSchema"
      :publication-mode="publicationMode"
      @previous="moveToStep(2)"
      @next="dataNext"
    />
    <Step3DescribeDataset
      v-if="currentStep === 3 && associateSchemaForm.selectedSchema && associateSchemaForm.owned?.organization"
      v-model="datasetForm"
      @previous="goBackFromStep3"
      @next="describeNext"
    />
    <Step4CompletePublication
      v-if="currentStep === 4 && newDataset"
      :dataset="newDataset"
      @next="updateDataset"
    />
    <div class="h-64" />
  </div>
</template>

<script setup lang="ts">
import type { Dataset, Frequency, Owned, Resource, SchemaPublicationMode, SpatialZone } from '@datagouv/components-next'
import Step1AssociateSchema from '~/components/Datasets/Structured/Step1AssociateSchema.vue'
import Step2LoadData from '~/components/Datasets/Structured/Step2LoadData.vue'
import Step2Sheet from '~/components/Datasets/Structured/Step2Sheet.vue'
import Step3DescribeDataset from '~/components/Datasets/Structured/Step3DescribeDataset.vue'
import Step4CompletePublication from '~/components/Datasets/New/Step4CompletePublication.vue'
import Stepper from '~/components/Stepper/Stepper.vue'
import type { DatasetForm, EnrichedLicense, ResourceForm, SpatialGranularity, Tag } from '~/types/types'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import type { AssociateSchemaForm } from '~/types/schema'

const { t } = useTranslation()
const config = useRuntimeConfig()
const route = useRoute()
const { $api } = useNuxtApp()
const { start, set, progress, finish } = useLoadingIndicator()

const ASSOCIATE_SCHEMA_FORM_STATE = 'structured-associate-schema-form'
const DATASET_FILES_STATE = 'structured-dataset-files'
const DATASET_FORM_STATE = 'structured-dataset-form'
const USE_SPREADSHEET_STATE = 'structured-use-spreadsheet'
const NEW_DATASET_STATE = 'structured-new-dataset'
const PUBLICATION_MODE_STATE = 'structured-publication-mode'
const UPLOADED_FILE_STATE = 'strutured-uploaded-file'

const steps = computed(() => ([
  t('Associez un schéma'),
  t('Chargez vos données'),
  t('Décrivez votre jeu de données'),
  t('Finalisez la publication'),
]))

const useSpreadsheet = useState(USE_SPREADSHEET_STATE, () => false)

const datasetForm = useState(DATASET_FORM_STATE, () => ({
  title: '',
  acronym: '',
  description: '',
  featured: false,
  owned: null as Owned | null,
  tags: [] as Array<Tag>,
  license: null as EnrichedLicense | null,
  temporal_coverage: { start: null, end: null },
  frequency: null as Frequency | null,
  spatial_zones: [] as Array<SpatialZone>,
  spatial_granularity: null as SpatialGranularity | null,
  contact_points: [],
  private: true,
} as DatasetForm))

const associateSchemaForm = useState(ASSOCIATE_SCHEMA_FORM_STATE, () => ({
  owned: null,
  existingDataset: null,
  selectedSchema: null,
} as AssociateSchemaForm))

const file = useState<File | null>(UPLOADED_FILE_STATE, () => null)
const resources = useState<Array<ResourceForm>>(DATASET_FILES_STATE, () => [])
const newDataset = useState<Dataset | null>(NEW_DATASET_STATE, () => null)
const publicationMode = useState<SchemaPublicationMode>(PUBLICATION_MODE_STATE, () => 'new')

const currentStep = computed(() => {
  const step = route.query.step as string
  if (step === '2-sheet') return '2-sheet'
  return parseInt(step) || 1
})

const currentStepNumber = computed(() => {
  const step = currentStep.value
  if (step === '2-sheet') return 2
  return step
})

const isCurrentStepValid = computed(() => {
  const step = currentStepNumber.value

  if (step < 1) return false
  if (step > steps.value.length) return false
  if (step === 4 && !newDataset.value) return false

  return true
})

function moveToStep(step: '2-sheet' | 1 | 2 | 3 | 4) {
  if (step !== '2-sheet') {
    file.value = null
  }
  return navigateTo({ path: route.path, query: { ...route.query, step } })
}

function dataNext() {
  if (publicationMode.value === 'existing') {
    save()
  }
  else {
    datasetForm.value.title = `${associateSchemaForm.value.selectedSchema?.title} (${associateSchemaForm.value.owned?.organization.name})`
    datasetForm.value.description = `Ce jeu de données répond aux spécifications du schéma ${associateSchemaForm.value.selectedSchema?.title}`
    datasetForm.value.owned = associateSchemaForm.value.owned
    moveToStep(3)
  }
}

function goBackFromStep3() {
  // Si on a utilisé le tableur, retourner à l'écran tableur
  if (useSpreadsheet.value) {
    moveToStep('2-sheet')
  }
  else {
    moveToStep(2)
  }
}

function describeNext() {
  save()
}

function openSheet(fileToOpen?: File) {
  file.value = fileToOpen ?? null
  moveToStep('2-sheet')
}

async function save() {
  try {
    start()

    if (publicationMode.value === 'existing' && associateSchemaForm.value.existingDataset) {
      newDataset.value = associateSchemaForm.value.existingDataset
    }
    else {
      newDataset.value = newDataset.value || await $api<Dataset>('/api/1/datasets/', {
        method: 'POST',
        body: JSON.stringify(datasetToApi(datasetForm.value, { private: true })),
      })
    }
    const dataset = newDataset.value

    let results: Array<PromiseSettledResult<Resource>> = []
    try {
      start()
      for (const chunk of chunkArray(resources.value, config.public.maxNumberOfResourcesToUploadInParallel)) {
        results = [...results, ...await Promise.allSettled(chunk.map(async (resource) => {
          const result = await saveResourceForm(dataset, resource)
          set(progress.value + 100 / resources.value.length)
          return result
        }))]
      }
      finish()
    }
    catch {
      finish({ error: true })
    }

    if (results.every(f => f.status !== 'rejected')) {
      if (publicationMode.value === 'existing') {
        await navigateTo(`/datasets/${dataset.slug}`)
        clearNuxtState(NEW_DATASET_STATE)
      }
      else {
        await moveToStep(4)
      }
      associateSchemaForm.value = {
        owned: null,
        existingDataset: null,
        selectedSchema: null,
      }
      clearNuxtState(USE_SPREADSHEET_STATE)
      clearNuxtState(DATASET_FORM_STATE)
      clearNuxtState(DATASET_FILES_STATE)
      clearNuxtState(PUBLICATION_MODE_STATE)
      clearNuxtState(UPLOADED_FILE_STATE)
    }
  }
  finally {
    finish()
  }
}

async function updateDataset(asPrivate: boolean) {
  if (!newDataset.value) {
    return moveToStep(3)
  }
  if (!asPrivate) {
    start()
    try {
      newDataset.value.private = false
      await $api<Dataset>(`/api/1/datasets/${newDataset.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(newDataset.value),
      })
    }
    finally {
      finish()
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

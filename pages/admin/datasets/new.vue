<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem
        to="/"
      >
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/datasets">
        {{ $t('Jeux de données') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Formulaire de publication') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <Stepper
      :steps
      :current-step
    />

    <Step1PublishingType
      v-if="currentStep === 1"
      @start="moveToStep(2)"
    />
    <DescribeDataset
      v-if="currentStep === 2"
      v-model="datasetForm"
      :submit-label="t('Suivant')"
      type="create"
      @previous="moveToStep(1)"
      @submit="datasetNext"
    />
    <Step3AddResources
      v-if="currentStep === 3"
      :resources
      :dataset-form
      :loading
      @previous="moveToStep(2)"
      @next="filesNext"
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
import { defaultAccessTypeForm, type Dataset, type Frequency, type Owned, type Resource } from '@datagouv/components-next'
import Step1PublishingType from '~/components/Datasets/New/Step1PublishingType.vue'
import DescribeDataset from '~/components/Datasets/DescribeDataset.vue'
import Step3AddResources from '~/components/Datasets/New/Step3AddResources.vue'
import Step4CompletePublication from '~/components/Datasets/New/Step4CompletePublication.vue'
import Stepper from '~/components/Stepper/Stepper.vue'
import type { DatasetForm, EnrichedLicense, ResourceForm, SpatialGranularity, SpatialZone, Tag } from '~/types/types'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { t } = useTranslation()
const config = useRuntimeConfig()
const route = useRoute()
const { $api } = useNuxtApp()

const DATASET_FORM_STATE = 'dataset-form'
const DATASET_FILES_STATE = 'dataset-files'
const LOADING_STATE = 'dataset-loading'

const steps = computed(() => ([
  t('Publier des données sur {site}', { site: config.public.title }),
  t('Décrivez votre jeu de données'),
  t('Ajoutez des fichiers'),
  t('Finalisez la publication'),
]))

const loading = useState(LOADING_STATE, () => false)

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
  ...defaultAccessTypeForm(),
} as DatasetForm))
const resources = useState<Array<ResourceForm>>(DATASET_FILES_STATE, () => [])
const newDataset = useState<Dataset | null>('new-dataset', () => null)
const currentStep = computed(() => parseInt(route.query.step as string) || 1)
const isCurrentStepValid = computed(() => {
  if (currentStep.value < 1) return false
  if (currentStep.value > steps.value.length) return false
  if (currentStep.value === 3 && (!datasetForm.value || !datasetForm.value.title)) return false
  if (currentStep.value > 3 && !newDataset.value) return false
  return true
})

const moveToStep = (step: number) => {
  return navigateTo({ path: route.path, query: { ...route.query, step } })
}

const datasetNext = () => {
  moveToStep(3)
}

const filesNext = (files: Array<ResourceForm>) => {
  resources.value = files
  save()
}

async function save() {
  try {
    loading.value = true
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

    const dataset = newDataset.value = newDataset.value || await $api<Dataset>('/api/1/datasets/', {
      method: 'POST',
      body: JSON.stringify(datasetToApi(datasetForm.value, { private: true, extras: {
        publish_source: `${config.public.title}:new`,
      } })),
    })

    let results: Array<PromiseSettledResult<Resource>> = []
    for (const chunk of chunkArray(resources.value, config.public.maxNumberOfResourcesToUploadInParallel)) {
      results = [...results, ...await Promise.allSettled(chunk.map(resource => saveResourceForm(dataset, resource)))]
    }

    if (results.every(f => f.status !== 'rejected')) {
      await moveToStep(4)
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

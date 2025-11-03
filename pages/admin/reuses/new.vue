<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem
        to="/"
        external
      >
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/reuses">
        {{ $t('Réutilisations') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Formulaire de publication') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <Stepper
      :steps
      :current-step
    />

    <DescribeReuse
      v-if="currentStep === 1"
      v-model="reuseForm"
      type="create"
      @submit="reuseNext"
    >
      <template #button>
        <BrandedButton
          type="submit"
          color="primary"
        >
          {{ $t("Suivant") }}
        </BrandedButton>
      </template>
    </DescribeReuse>

    <Step2AddDatasetsAndDataservices
      v-if="currentStep === 2"
      v-model:datasets="datasets"
      v-model:dataservices="dataservices"
      :loading
      @previous="moveToStep(1)"
      @next="datasetsAndDataservicesNext"
    />
    <Step3CompletePublication
      v-if="currentStep === 3 && newReuse"
      :loading
      :reuse="newReuse"
      @next="updateReuse"
    />
    <div class="h-64" />
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import type { Dataservice, DatasetV2, Reuse } from '@datagouv/components-next'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import DescribeReuse from '~/components/Reuses/DescribeReuse.vue'
import Step2AddDatasetsAndDataservices from '~/components/Reuses/New/Step2AddDatasetsAndDataservices.vue'
import Step3CompletePublication from '~/components/Reuses/New/Step3CompletePublication.vue'
import Stepper from '~/components/Stepper/Stepper.vue'
import type {
  DatasetSuggest,
  ReuseForm,
} from '~/types/types'

const { t } = useTranslation()
const route = useRoute()
const { $api, $fileApi } = useNuxtApp()

const steps = computed(() => [
  t('Décrivez votre réutilisation'),
  t('Lier des jeux de données et des APIs'),
  t('Finalisez la publication'),
])

const REUSE_FORM_STATE = 'reuse-form'
const REUSE_DATASET_STATE = 'reuse-datasets'
const REUSE_DATASERVICE_STATE = 'reuse-dataservices'

const reuseForm = useState(
  REUSE_FORM_STATE,
  () =>
    ({
      owned: null,
      title: '',
      url: '',
      type: null,
      topic: null,
      description: '',
      tags: [],
      image: null,
      private: true,
      featured: false,
      archived: null,
    } as ReuseForm),
)

const loading = useState<boolean>(
  'reuse-loading',
  () => false,
)

onMounted(async () => {
  if (!route.query.dataset_id) return

  const dataset = await $api<DatasetV2>(`/api/2/datasets/${route.query.dataset_id}/`)
  if (!datasets.value.some(d => d.id === dataset.id)) {
    datasets.value.push(dataset)
  }
})

const datasets = useState<Array<DatasetV2 | DatasetSuggest>>(
  REUSE_DATASET_STATE,
  () => [],
)

onMounted(async () => {
  if (!route.query.dataservice_id) return

  const dataservice = await $api<Dataservice>(`/api/2/dataservices/${route.query.dataservice_id}/`)
  if (!dataservices.value.some(d => d.id === dataservice.id)) {
    dataservices.value.push(dataservice)
  }
})

const dataservices = useState<Array<Dataservice>>(
  REUSE_DATASERVICE_STATE,
  () => [],
)

const newReuse = useState<Reuse | null>('new-reuse', () => null)

const currentStep = computed(() => parseInt(route.query.step as string) || 1)
const isCurrentStepValid = computed(() => {
  if (currentStep.value < 1) return false
  if (currentStep.value > steps.value.length) return false
  if (currentStep.value === 2 && (!reuseForm.value || !reuseForm.value.title)) return false
  if (currentStep.value > 2 && !newReuse.value) return false

  return true
})

function moveToStep(step: number) {
  return navigateTo({ path: route.path, query: { ...route.query, step } })
}

function reuseNext() {
  moveToStep(2)
}

function datasetsAndDataservicesNext() {
  save()
}

async function save() {
  try {
    loading.value = true
    newReuse.value = await $api<Reuse>('/api/1/reuses/', {
      method: 'POST',
      body: JSON.stringify(reuseToApi(reuseForm.value, {
        private: true,
        datasets: datasets.value,
        dataservices: dataservices.value,
      })),
    })

    if (reuseForm.value.image && typeof reuseForm.value.image !== 'string') {
      const formData = new FormData()
      formData.set('file', reuseForm.value.image)
      await $fileApi(`/api/1/reuses/${newReuse.value.id}/image/`, {
        method: 'POST',
        body: formData,
      })
    }

    await moveToStep(3)
    clearNuxtState(REUSE_FORM_STATE)
    clearNuxtState(REUSE_DATASET_STATE)
    clearNuxtState(REUSE_DATASERVICE_STATE)
  }
  finally {
    loading.value = false
  }
}

async function updateReuse(asPrivate: boolean) {
  if (!newReuse.value) {
    return moveToStep(3)
  }
  if (!asPrivate) {
    try {
      loading.value = true
      newReuse.value.private = false
      await $api<Reuse>(`/api/1/reuses/${newReuse.value.id}/`, {
        method: 'PUT',
        body: JSON.stringify(newReuse.value),
      })
    }
    finally {
      loading.value = false
    }
  }

  await navigateTo(`/reuses/${newReuse.value.slug}`)
}

watchEffect(() => {
  if (!isCurrentStepValid.value) {
    moveToStep(1)
  }
})
</script>

<template>
  <div>
    <Breadcrumb>
      <li>
        <NuxtLinkLocale
          class="fr-breadcrumb__link"
          to="/"
        >
          {{ t("Home") }}
        </NuxtLinkLocale>
      </li>
      <li>
        <NuxtLinkLocale
          class="fr-breadcrumb__link"
          to="/dataservices"
        >
          {{ t("Dataservices") }}
        </NuxtLinkLocale>
      </li>
      <li>
        <a
          class="fr-breadcrumb__link"
          aria-current="page"
        >
          {{ t("Publishing form") }}
        </a>
      </li>
    </Breadcrumb>

    <Stepper
      :steps
      :current-step
    />

    <DescribeDataservice
      v-if="currentStep === 1"
      v-model="dataserviceForm"
      type="create"
      @submit="dataserviceNext"
    >
      <template #button>
        <BrandedButton
          type="submit"
          color="primary"
        >
          {{ $t("Next") }}
        </BrandedButton>
      </template>
    </DescribeDataservice>
    <Step2AddDatasets
      v-if="currentStep === 2"
      v-model="datasets"
      :loading
      @previous="moveToStep(1)"
      @next="datasetsNext"
    />
    <Step3CompletePublication
      v-if="currentStep === 3 && newDataservice"
      :dataservice="newDataservice"
      :loading
      @previous="moveToStep(2)"
      @next="updateDataservice"
    />
    <div class="h-64" />
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import type { Dataservice, Dataset, DatasetV2 } from '@datagouv/components-next'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import DescribeDataservice from '~/components/Dataservices/DescribeDataservice.vue'
import Step2AddDatasets from '~/components/Dataservices/New/Step2AddDatasets.vue'
import Step3CompletePublication from '~/components/Dataservices/New/Step3CompletePublication.vue'
import Stepper from '~/components/Stepper/Stepper.vue'
import type {
  DataserviceForm,
  DatasetSuggest,
} from '~/types/types'

const { t } = useI18n()
const route = useRoute()
const { $api } = useNuxtApp()

const steps = computed(() => [
  t('Describe your dataservice'),
  t('Link datasets'),
  t('Complete your publishing'),
])

const DATASERVICE_FORM_STATE = 'dataservice-form'
const DATASERVICE_DATASETS_STATE = 'dataservice-datasets'

const dataserviceForm = useState(
  DATASERVICE_FORM_STATE,
  () =>
    ({
      owned: null,
      title: '',
      acronym: '',
      description: '',
      authorization_request_url: '',
      availability: '',
      base_api_url: '',
      datasets: [],
      technical_documentation_url: '',
      machine_documentation_url: '',
      business_documentation_url: '',
      access_type: 'open',
      license: null,
      private: true,
      rate_limiting: '',
      contact_points: [],
    } as DataserviceForm),
)

const datasets = useState<Array<Dataset | DatasetV2 | DatasetSuggest>>(
  DATASERVICE_DATASETS_STATE,
  () => [],
)

const newDataservice = useState<Dataservice | null>('new-dataservice', () => null)
const loading = useState<boolean>('dataservice-loading', () => false)

const currentStep = computed(() => parseInt(route.query.step as string) || 1)
const isCurrentStepValid = computed(() => {
  if (currentStep.value < 1) return false
  if (currentStep.value > steps.value.length) return false
  if (currentStep.value === 2 && (!dataserviceForm.value || !dataserviceForm.value.title)) return false
  if (currentStep.value > 2 && !newDataservice.value) return false

  return true
})

function moveToStep(step: number) {
  return navigateTo({ path: route.path, query: { ...route.query, step } })
}

const dataserviceNext = () => {
  moveToStep(2)
}
async function datasetsNext() {
  await save()
}

async function save() {
  try {
    loading.value = true
    if (
      dataserviceForm.value.contact_points
      && dataserviceForm.value.owned?.organization
    ) {
      for (const contactPointKey in dataserviceForm.value.contact_points) {
        if (dataserviceForm.value.contact_points[contactPointKey] && !('id' in dataserviceForm.value.contact_points[contactPointKey])) {
          dataserviceForm.value.contact_points[contactPointKey] = await newContactPoint($api, dataserviceForm.value.owned?.organization, dataserviceForm.value.contact_points[contactPointKey])
        }
      }
    }

    newDataservice.value = await $api<Dataservice>('/api/1/dataservices/', {
      method: 'POST',
      body: JSON.stringify(dataserviceToApi(dataserviceForm.value, {
        datasets: datasets.value,
        private: true,
      })),
    })

    await moveToStep(3)

    clearNuxtState(DATASERVICE_FORM_STATE)
    clearNuxtState(DATASERVICE_DATASETS_STATE)
  }
  finally {
    loading.value = false
  }
}

async function updateDataservice(asPrivate: boolean) {
  if (!newDataservice.value) {
    return moveToStep(3)
  }
  if (!asPrivate) {
    try {
      loading.value = true
      await $api<Dataservice>(`/api/1/dataservices/${newDataservice.value.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(dataserviceToApi(dataserviceToForm(newDataservice.value), {
          private: false,
        })),
      })
    }
    finally {
      loading.value = false
    }
  }

  await navigateTo(newDataservice.value.self_web_url, { external: true })
}

watchEffect(() => {
  if (!isCurrentStepValid.value) {
    moveToStep(1)
  }
})
</script>

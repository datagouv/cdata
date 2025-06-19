<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem
        to="/"
        external
      >
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Moissonneurs') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Formulaire de publication') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <Stepper
      :steps
      :current-step
    />

    <DescribeHarvester
      v-if="currentStep === 1"
      v-model="harvesterForm"
      type="create"
      @submit="harvesterNext"
    >
      <template #button>
        <BrandedButton
          type="submit"
          color="primary"
        >
          {{ $t("Next") }}
        </BrandedButton>
      </template>
    </DescribeHarvester>

    <PreviewStep
      v-if="currentStep === 2"
      :harvester-form="harvesterForm"
      @previous="moveToStep(1)"
      @next="previewNext"
    />

    <CompletePublicationStep
      v-if="currentStep === 3 && newHarvester"
      :harvester="newHarvester"
    />
    <div class="h-64" />
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import CompletePublicationStep from '~/components/Harvesters/CompletePublicationStep.vue'
import DescribeHarvester from '~/components/Harvesters/DescribeHarvester.vue'
import PreviewStep from '~/components/Harvesters/PreviewStep.vue'
import Stepper from '~/components/Stepper/Stepper.vue'
import type { HarvesterForm, HarvesterSource } from '~/types/harvesters'

const { t } = useI18n()
const route = useRoute()
const { $api } = useNuxtApp()

const steps = computed(() => [
  t('Describe your harvester'),
  t('Preview your harvester'),
  t('Complete your publishing'),
])

const HARSVESTER_FORM_STATE = 'harvester-form'

const harvesterForm = useState(
  HARSVESTER_FORM_STATE,
  () =>
    ({
      owned: null,
      name: '',
      description: '',
      url: '',
      backend: '', // todo add most common backend
      topic: null,
      filters: [],
      configs: [],
      schedule: '',
      autoarchive: true,
      active: true,
    } as HarvesterForm),
)

const loading = useState<boolean>(
  'reuse-loading',
  () => false,
)

const newHarvester = useState<HarvesterSource | null>('new-harvester', () => null)

const currentStep = computed(() => parseInt(route.query.step as string) || 1)
const isCurrentStepValid = computed(() => {
  if (currentStep.value < 1) return false
  if (currentStep.value > steps.value.length) return false
  if (currentStep.value === 2 && (!harvesterForm.value || !harvesterForm.value.name)) return false
  if (currentStep.value > 2 && !newHarvester.value) return false

  return true
})

function moveToStep(step: number) {
  return navigateTo({ path: route.path, query: { ...route.query, step } })
}

function harvesterNext() {
  moveToStep(2)
}

function previewNext() {
  save()
}

async function save() {
  try {
    loading.value = true
    newHarvester.value = await $api<HarvesterSource>('/api/1/harvest/sources/', {
      method: 'POST',
      body: JSON.stringify(harvesterToApi(harvesterForm.value)),
    })

    await moveToStep(3)
    clearNuxtState(HARSVESTER_FORM_STATE)
  }
  finally {
    loading.value = false
  }
}

watchEffect(() => {
  if (!isCurrentStepValid.value) {
    moveToStep(1)
  }
})
</script>

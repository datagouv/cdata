<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/">
        {{ $t('Home') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Community resources') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Publishing form') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <Stepper
      :steps
      :current-step
    />

    <DescribeResource
      v-if="currentStep === 1"
      v-model="resourceForm"
      type="create-community"
      :submit-label="t('Next')"
      @submit="postNext"
    >
      <div class="flex justify-end">
        <BrandedButton type="submit">
          {{ $t('Save') }}
        </BrandedButton>
      </div>
    </DescribeResource>
    <div class="h-64" />
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, type Dataset, type DatasetV2 } from '@datagouv/components-next'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import DescribeResource from '~/components/Datasets/DescribeResource.vue'
import PostContentForm from '~/components/Posts/PostContentForm.vue'
import Stepper from '~/components/Stepper/Stepper.vue'
import type { DatasetSuggest, ResourceForm } from '~/types/types'

const { t } = useI18n()
const route = useRoute()

const steps = computed(() => [
  t('Describe your community resource'),
  t('Complete your publishing'),
])

const POST_FORM_STATE = 'post-form'

const resourceForm = useState<ResourceForm>(POST_FORM_STATE, () => ({
  owned: null,
  resource: null,
  title: '',
  type: 'main',
  description: '',
  schema: null,
  filetype: null,
  url: '',
  mime: null,
  format: null,
} satisfies ResourceForm))

const currentStep = computed(() => parseInt(route.query.step as string) || 1)
const isCurrentStepValid = computed(() => {
  if (currentStep.value < 1) return false
  if (currentStep.value > steps.value.length) return false
  // if (currentStep.value === 2 && (!postForm.value || !postForm.value.name)) return false

  return true
})

function moveToStep(step: number) {
  return navigateTo({ path: route.path, query: { ...route.query, step } })
}

function postNext(additionalData: { dataset: Dataset | DatasetV2 | DatasetSuggest | null }) {
  if (!additionalData.dataset) throw new Error('create-community should always submit with a dataset')

  save(additionalData.dataset)
  // moveToStep(2)
}

async function save(dataset: Dataset | DatasetV2 | DatasetSuggest) {
  try {
    await saveResourceForm(dataset, resourceForm.value)
  }
  finally {
    // clearNuxtState(POST_LOADING_STATE)
  }
}

watchEffect(() => {
  if (!isCurrentStepValid.value) {
    moveToStep(1)
  }
})
</script>

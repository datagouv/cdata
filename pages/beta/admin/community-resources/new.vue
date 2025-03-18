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
      @submit="save"
    >
      <div class="flex justify-end">
        <BrandedButton type="submit">
          {{ $t('Save') }}
        </BrandedButton>
      </div>
    </DescribeResource>

    <CompleteResourcePublicationStep
      v-if="currentStep === 2 && communityResource"
      :resource="communityResource"
    />
    <div class="h-64" />
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, type CommunityResource } from '@datagouv/components-next'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import CompleteResourcePublicationStep from '~/components/Datasets/CompleteResourcePublicationStep.vue'
import DescribeResource from '~/components/Datasets/DescribeResource.vue'
import Stepper from '~/components/Stepper/Stepper.vue'
import type { CommunityResourceForm } from '~/types/types'

const { t } = useI18n()
const route = useRoute()

const steps = computed(() => [
  t('Describe your community resource'),
  t('Complete your publishing'),
])

const COMMUNITY_RESOURCE_FORM_STATE = 'community-resource-form'

const communityResource = useState<CommunityResource | null>(
  'new-community-resource',
  () => null,
)

const resourceForm = useState<CommunityResourceForm>(COMMUNITY_RESOURCE_FORM_STATE, () => ({
  owned: null,
  dataset: null,
  resource: null,
  title: '',
  type: 'main',
  description: '',
  schema: null,
  filetype: null,
  url: '',
  mime: null,
  format: null,
} satisfies CommunityResourceForm))

const currentStep = computed(() => parseInt(route.query.step as string) || 1)
const isCurrentStepValid = computed(() => {
  if (currentStep.value < 1) return false
  if (currentStep.value > steps.value.length) return false
  if (currentStep.value === 2 && (!communityResource.value || !communityResource.value.title)) return false

  return true
})

function moveToStep(step: number) {
  return navigateTo({ path: route.path, query: { ...route.query, step } })
}

async function save() {
  communityResource.value = await saveResourceForm(resourceForm.value.dataset, resourceForm.value)
  moveToStep(2)
}

watchEffect(() => {
  if (!isCurrentStepValid.value) {
    moveToStep(1)
  }
})
</script>

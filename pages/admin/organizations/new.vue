<template>
  <div>
    <Breadcrumb>
      <li>
        <NuxtLinkLocale
          class="fr-breadcrumb__link"
          to="/"
          :external="true"
        >
          {{ t('Home') }}
        </NuxtLinkLocale>
      </li>
      <li>
        <NuxtLinkLocale
          class="fr-breadcrumb__link"
          to="/organizations"
          :external="true"
        >
          {{ t('Organizations') }}
        </NuxtLinkLocale>
      </li>
      <li>
        <a
          class="fr-breadcrumb__link"
          aria-current="page"
        >
          {{ t('Publishing form') }}
        </a>
      </li>
    </Breadcrumb>

    <Stepper
      :steps
      :current-step
    />

    <OrganizationNewStep1CreateOrJoinOrganization
      v-if="currentStep === 1"
      @start="moveToStep(2)"
    />
    <OrganizationNewStep2DescribeOrganization
      v-if="currentStep === 2"
      v-model="organizationForm"
      type="create"
      :submit-label="$t('Next')"
      :errors="errors"
      :loading
      @previous="moveToStep(1)"
      @submit="createOrganizationAndMoveToNextStep"
    />
    <OrganizationNewStep3CompleteTheOrganization
      v-if="currentStep === 3 && newOrganization"
      :organization="newOrganization"
      :errors="errors"
    />
  </div>
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'
import { uploadLogo } from '~/api/organizations'
import Stepper from '~/components/Stepper/Stepper.vue'
import { loadMe } from '~/utils/auth'
import type { NewOrganization } from '~/types/types'

const { t } = useI18n()
const config = useRuntimeConfig()
const route = useRoute()
const { $api } = useNuxtApp()
const { organizations } = useCurrentOwned()
const me = useMe()

const steps = computed(() => ([
  t('Create or join an organization on {site}', { site: config.public.title }),
  t('Describe your organization'),
  t('Finalize your organization'),
]))

const organizationForm = ref<NewOrganization>({
  name: '',
  acronym: '',
  business_number_id: '',
  description: '',
  url: '',
  logo: '',
})

const errors = ref<Array<string>>([])
const newOrganization = useState<Organization | null>('new-organization', () => null)

const loading = ref<boolean>(false)

const currentStep = computed(() => parseInt(route.query.step as string) || 1)

const isCurrentStepValid = computed(() => {
  if (currentStep.value < 1) return false
  if (currentStep.value > steps.value.length) return false

  // TODO check that org exists

  return true
})

function moveToStep(step: number) {
  navigateTo({ path: route.path, query: { ...route.query, step } })
}

async function createOrganizationAndMoveToNextStep(logo_file: File | null) {
  errors.value = []
  let moveToNextStep = false
  try {
    loading.value = true
    newOrganization.value = await $api<Organization>('/api/1/organizations/', {
      method: 'POST',
      body: JSON.stringify({
        ...organizationForm.value,
        business_number_id: cleanSiret(organizationForm.value.business_number_id),
      }),
    })
    organizations.value[newOrganization.value.id] = newOrganization.value
    moveToNextStep = true
  }
  catch (e) {
    if (e instanceof Error) {
      errors.value.push(e.message)
    }
  }
  finally {
    loading.value = false
  }
  if (logo_file && newOrganization.value) {
    try {
      loading.value = true
      const resp = await uploadLogo(newOrganization.value.id, logo_file)
      newOrganization.value.logo_thumbnail = resp.image
    }
    catch {
      errors.value.push(t('Failed to upload logo, you can upload it again in your management panel'))
    }
    finally {
      loading.value = false
    }
  }
  if (moveToNextStep) {
    loadMe(me)
    moveToStep(3)
  }
}

watchEffect(() => {
  if (!isCurrentStepValid.value) {
    moveToStep(1)
  }
})
</script>

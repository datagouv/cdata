<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem
        to="/"
        external
      >
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/organizations">
        {{ $t('Organisations') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Formulaire de publication') }}
      </BreadcrumbItem>
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
      :submit-label="$t(`Créer l'organisation`)"
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
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const route = useRoute()
const { $api } = useNuxtApp()
const { organizations, setCurrentOrganization } = useCurrentOwned()
const me = useMe()

const steps = computed(() => ([
  t('Créer ou rejoindre une organisation sur {site}', { site: config.public.title }),
  t('Décrivez votre organisation'),
  t('Finaliser votre organisation'),
]))

const organizationForm = ref<NewOrganization>({
  name: '',
  acronym: '',
  business_number_id: '',
  description: '',
  url: '',
  logo: '',
})

const moveToNextStep = ref(false)
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
  moveToNextStep.value = false
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
    setCurrentOrganization(newOrganization.value)
    moveToNextStep.value = true
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
      errors.value.push(t(`Impossible de téléverser le logo, vous pouvez le téléverser à nouveau dans votre panneau d'administration`))
    }
    finally {
      loading.value = false
    }
  }
  if (moveToNextStep.value) {
    loadMe(me)
    await moveToStep(3)
    moveToNextStep.value = false
  }
}

watchEffect(() => {
  if (!isCurrentStepValid.value) {
    moveToStep(1)
  }
})
watch(currentStep, (step) => {
  // reset state when returning to page
  if (step === 1) {
    newOrganization.value = null
  }
  // redirect to organization profile when moving back to step 2
  if (newOrganization.value?.id && newOrganization.value.id in organizations.value
    && !moveToNextStep.value
    && !loading.value
    && step < 3) {
    navigateTo(localePath(`/admin/organizations/${newOrganization.value.id}/profile`), { replace: true })
  }
}, { immediate: true })
</script>

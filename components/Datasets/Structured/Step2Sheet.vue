<template>
  <div>
    <PaddedContainer>
      <SimpleBanner
        type="primary"
        class="mb-4 flex items-center space-x-5"
      >
        <NuxtImg
          src="/illustrations/notebook.svg"
          loading="lazy"
          class="size-14 shrink-0"
          alt=""
        />
        <div class="w-full">
          <p class="font-bold mb-1">
            {{ $t('Saisissez vos données') }}
          </p>
          <p class="m-0 text-xs/5">
            {{ $t('Utilisez le tableur pour saisir vos données conformément au schéma sélectionné.') }}
          </p>
        </div>
      </SimpleBanner>

      <SimpleBanner
        v-if="!schemaDetails"
        type="warning"
        class="flex items-center space-x-2"
      >
        <RiErrorWarningLine class="shink-0 size-6" />
        <span>{{ $t(`Aucun schéma n'a été sélectionné. Veuillez retourner à l'étape précédente.`) }}</span>
      </SimpleBanner>

      <div v-else>
        <div class="fr-mb-3w">
          <p class="fr-text--sm fr-mb-1w">
            <strong>{{ $t('Schéma utilisé :') }}</strong> {{ schemaDetails?.title || $t('Non défini') }}
          </p>
        </div>
        <AnimatedLoader v-if="isLoading" />
        <TabularEditor
          ref="tabularEditor"
          v-model:uploaded-file="uploadedFile"
          v-model:resource-title="resourceTitle"
          v-model:validation-report="validationReport"
          :schema
          :schema-details
        />
      </div>

      <div class="fr-grid-row justify-between fr-mt-4w">
        <BrandedButton
          color="secondary"
          @click="goBack"
        >
          {{ $t("Retour") }}
        </BrandedButton>
        <BrandedButton
          color="primary"
          :disabled="!hasNoErrors"
          @click="submit"
        >
          {{ publicationMode === 'existing' ? $t("Publier") : $t("Suivant") }}
        </BrandedButton>
      </div>
    </PaddedContainer>
  </div>
</template>

<script setup lang="ts">
import { AnimatedLoader, BrandedButton, getSchemaVersion, PaddedContainer, SimpleBanner } from '@datagouv/components-next'
import type { SchemaPublicationMode, RegisteredSchema, SchemaDetails } from '@datagouv/components-next'
import { ref, onMounted, computed } from 'vue'
import type { ResourceForm } from '~/types/types'
import 'tabulator-tables/dist/css/tabulator.min.css'
import { RiErrorWarningLine } from '@remixicon/vue'
import { computedAsync } from '@vueuse/core'
import { ofetch } from 'ofetch'
import type { ValidationReport } from '~/types/schema'

const props = defineProps<{
  schema: RegisteredSchema | null
  publicationMode: SchemaPublicationMode
}>()

const emit = defineEmits<{
  (e: 'previous' | 'next'): void
}>()

const tabularEditor = useTemplateRef<InstanceType<typeof TabularEditor>>('tabularEditor')

const TabularEditor = defineAsyncComponent(() => {
  start()
  return import('../TabularEditor.client.vue').then((module) => {
    finish()
    return module.default
  })
})

const uploadedFile = defineModel<File | null>({ required: true })
const resources = defineModel<Array<ResourceForm>>('resources', { required: true })

const { t } = useTranslation()
const route = useRoute()

const { isLoading, start, finish } = useLoadingIndicator()

const schemaVersion = computed(() => getSchemaVersion(props.schema))

const validationReport = ref<ValidationReport | null>(null)
const resourceTitle = ref<string>('')

const hasNoErrors = computed(() => {
  if (!validationReport.value) return false
  const errorCount = validationReport.value.report?.errors?.length || 0
  return errorCount === 0
})

const schemaDetails = computedAsync(async () => {
  if (!props.schema) {
    return Promise.resolve(null)
  }
  return await ofetch<SchemaDetails>(props.schema.schema_url)
})

const goBack = () => {
  navigateTo({ path: route.path, query: { step: 2 } })
}

const submit = async () => {
  if (!tabularEditor.value) {
    return
  }
  tabularEditor.value?.generateFile()

  await nextTick()

  if (!uploadedFile.value) {
    return
  }

  const resourceForm: ResourceForm = {
    resource: null,
    title: resourceTitle.value,
    type: 'main',
    file: {
      raw: uploadedFile.value,
      state: { status: 'waiting' },
    },
    description: t('Données saisies via le tableur'),
    filetype: 'file' as const,
    schema: props.schema
      ? {
          name: props.schema.name,
          url: null,
          version: schemaVersion.value,
        }
      : null,
    schema_url: null,
    checksum_type: null,
    checksum_value: null,
  }

  if (resources.value.length > 0) {
    resources.value[0] = resourceForm
  }
  else {
    resources.value.push(resourceForm)
  }

  emit('next')
}

onMounted(() => {
  // Initialiser le titre de la ressource avec le format "donnees-nom-schema"
  if (!resourceTitle.value && props.schema?.name) {
    const schemaShortName = props.schema.name.split('/').pop() || 'schema'
    resourceTitle.value = `donnees-${schemaShortName}`
  }
  else if (!resourceTitle.value) {
    resourceTitle.value = 'donnees'
  }
})
</script>

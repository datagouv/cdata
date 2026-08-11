<template>
  <div>
    <PaddedContainer>
      <SimpleBanner
        v-if="!schema"
        type="warning"
        class="flex items-center space-x-2"
      >
        <RiErrorWarningLine class="shrink-0 size-6" />
        <span>{{ $t(`Aucun schéma n'a été sélectionné. Veuillez retourner à l'étape précédente.`) }}</span>
      </SimpleBanner>

      <SimpleBanner
        v-else-if="schemaDetailsError"
        type="danger"
        class="flex items-center space-x-2"
      >
        <RiErrorWarningLine class="shrink-0 size-6" />
        <span>{{ $t(`Le schéma sélectionné n'a pas pu être chargé. Réessayez, ou retournez à l'étape précédente pour en choisir un autre.`) }}</span>
      </SimpleBanner>

      <AnimatedLoader v-else-if="!schemaDetails" />

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
          @change-schema="changeSchema"
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

const schemaDetailsError = ref(false)

// The initial state matters here: without it the value stays `undefined` while the
// schema is being fetched, which is indistinguishable from "no schema selected"
const schemaDetails = computedAsync<SchemaDetails | null>(
  async () => {
    if (!props.schema) {
      return null
    }
    schemaDetailsError.value = false
    return await ofetch<SchemaDetails>(props.schema.schema_url)
  },
  null,
  { onError: () => {
    schemaDetailsError.value = true
  } },
)

const goBack = () => {
  navigateTo({ path: route.path, query: { step: 2 } })
}

const changeSchema = () => {
  navigateTo({ path: route.path, query: { step: 1 } })
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

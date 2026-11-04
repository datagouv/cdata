<template>
  <div>
    <div class="flex flex-wrap items-center gap-4 mt-2 mb-3">
      <Tooltip v-if="!canSuggest">
        <BrandedButton
          type="button"
          color="primary"
          :disabled="true"
        >
          <div class="flex items-center space-x-2">
            <RiSparklingLine
              class="size-4"
              aria-hidden="true"
            />
            <span>{{ $t('Suggérer une description à partir des fichiers') }}</span>
          </div>
        </BrandedButton>
        <template #tooltip>
          {{ tooltipWhenDisabled }}
        </template>
      </Tooltip>
      <BrandedButton
        v-else
        type="button"
        color="primary"
        :icon="RiSparklingLine"
        :loading="isGenerating"
        @click="handleSuggest"
      >
        <template v-if="isGenerating">
          {{ $t('Suggestion en cours…') }}
        </template>
        <template v-else>
          {{ $t('Suggérer une description à partir des fichiers') }}
        </template>
      </BrandedButton>
      <CdataLink
        v-if="config.public.generateDescriptionFeedbackUrl && hasReceivedSuggestion"
        :to="config.public.generateDescriptionFeedbackUrl"
        target="_blank"
        class="text-sm text-gray-medium"
      >
        {{ $t('Comment avez-vous trouvé cette suggestion ?') }}
      </CdataLink>
    </div>
    <SimpleBanner
      v-if="errorMessage"
      type="danger"
      class="mb-3"
    >
      {{ errorMessage }}
    </SimpleBanner>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, Tooltip, SimpleBanner } from '@datagouv/components-next'
import { RiSparklingLine } from '@remixicon/vue'
import CdataLink from '~/components/CdataLink.vue'
import type { ResourceForm } from '~/types/types'
import { buildCombinedExcerptFromResourceForms } from '~/utils/read-dataset-file-excerpt'

const description = defineModel<string>({ required: true })

const props = defineProps<{
  resources: Array<ResourceForm>
  title: string
  organization?: string
}>()

const { t } = useTranslation()
const config = useRuntimeConfig()

const isGenerating = ref(false)
const hasReceivedSuggestion = ref(false)
const errorMessage = ref<string | null>(null)

const hasTitle = computed(() => !!props.title?.trim())
const hasLocalFile = computed(() =>
  props.resources.some(r => r.filetype === 'file' && !!r.file?.raw),
)

const canSuggest = computed(() => hasTitle.value && hasLocalFile.value)

const tooltipWhenDisabled = computed(() => {
  if (!hasTitle.value) {
    return t('Renseignez d’abord le titre du jeu de données (étape précédente).')
  }
  if (!hasLocalFile.value) {
    return t('Ajoutez au moins un fichier téléversé au format texte (CSV, JSON, etc.) pour utiliser cette fonctionnalité.')
  }
  return ''
})

const GENERIC_ERROR = 'Une erreur s’est produite lors de la suggestion. Vérifiez qu’au moins un fichier contient du texte lisible, puis réessayez.'

async function handleSuggest() {
  errorMessage.value = null
  if (!canSuggest.value) {
    return
  }

  try {
    isGenerating.value = true
    const excerpt = await buildCombinedExcerptFromResourceForms(props.resources)
    if (!excerpt) {
      errorMessage.value = t('Aucun extrait lisible n’a pu être lu depuis vos fichiers. Utilisez un fichier texte ou CSV avec des en-têtes, ou un fichier JSON/XML.')
      return
    }

    const response = await $fetch<{ description?: string }>('/nuxt-api/albert/generate-dataset-long-description', {
      method: 'POST',
      body: {
        title: props.title.trim(),
        fileExcerpt: excerpt,
        ...(props.organization?.trim() && { organization: props.organization.trim() }),
      },
    })

    if (response.description?.trim()) {
      description.value = response.description.trim()
      hasReceivedSuggestion.value = true
    }
  }
  catch (error) {
    console.error('Failed to generate long dataset description:', error)
    const raw = error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'statusMessage' in error.data
      ? String((error.data as { statusMessage: string }).statusMessage)
      : error instanceof Error
        ? error.message
        : ''
    errorMessage.value = raw || GENERIC_ERROR
  }
  finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center py-12">
    <img
      :src="microscopeSrc"
      class="h-20 mb-3"
      alt=""
    >
    <p class="fr-text--bold mb-1">
      {{ t("Aperçu indisponible.") }}
    </p>
    <p class="text-sm text-gray-medium mb-4 text-center max-w-lg">
      {{ errorInfo.message }}
    </p>
    <p
      v-if="detailText"
      class="text-xs text-gray-medium mb-4 text-center max-w-lg"
    >
      {{ detailText }}
    </p>

    <!-- User CTA -->
    <div
      v-if="!showProducerCta && errorInfo.userCta"
      class="mb-4"
    >
      <BrandedButton
        color="secondary"
        @click="handleUserCta"
      >
        {{ errorInfo.userCta }}
      </BrandedButton>
    </div>

    <!-- Override action for too large files, visible to everyone (e.g. force preview) -->
    <div
      v-if="isTooLarge && $slots['too-large-action']"
      class="mb-4"
    >
      <!-- Scopeless here on purpose: the `force()` scope is provided by
         PreviewWrapper, which re-exports this slot. -->
      <slot name="too-large-action" />
    </div>
    <div
      v-else-if="errorInfo.producerCta && showProducerCta"
      class="mb-4"
    >
      <BrandedButton
        :href="supportHref"
        color="secondary"
        new-tab
        @click="handleProducerCta"
      >
        {{ errorInfo.producerCta }}
      </BrandedButton>
    </div>

    <!-- An OGC endpoint is a live service, not a file: `latest` points at its
         GetCapabilities description — often the very request that just failed —
         so never offer it as a download, like ResourceMainAction already does. -->
    <BrandedButton
      v-if="resource && !ogcService"
      :href="resource.latest"
      :icon="RiDownloadLine"
      rel="ugc nofollow noopener"
      download
      external
      class="matomo_download shrink-0"
      @click="trackEvent('Jeux de données', 'Télécharger un fichier', 'Bouton : télécharger un fichier')"
    >
      {{ t('Télécharger') }}
    </BrandedButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../composables/useTranslation'
import microscopeSrc from '../../../assets/illustrations/microscope.svg?url'
import BrandedButton from '../BrandedButton.vue'
import type { Resource } from '../../types/resources'
import { getPreviewErrorInfo, getPreviewErrorInfoByType, type PreviewErrorType } from '../../functions/previewErrors'
import { getParsingErrorMessage, detectOgcService } from '../../functions/resources'
import { trackEvent } from '../../functions/matomo'
import { useComponentsConfig } from '../../config'
import { RiDownloadLine } from '@remixicon/vue'

const props = defineProps<{
  // Optional: some callers (e.g. the tabular explorer) only know the resource
  // id, so they get no diagnostics or download button.
  resource?: Resource
  showProducerCta?: boolean
  // Explicit error type: callers use it when they know the cause better than
  // the resource metadata does (a runtime failure in the wrapper, a failed
  // map build…). Without it, the error type (and thus the message and CTAs) is
  // diagnosed from the metadata alone.
  errorType?: PreviewErrorType
  // File type shown in some error types' texts (e.g. "Ce fichier CSV est trop volumineux…").
  fileType?: string
  // Raw, error-specific output shown under the diagnosis (a parsing error, a
  // failed map generation) when the caller knows more than a message.
  detail?: string
}>()

const { t } = useTranslation()

const config = useComponentsConfig()

const supportHref = computed(() => config.supportUrl ?? '')

// Defined when the resource is a live OGC service (WMS/WFS…): the download
// button then offers the GetCapabilities description, so it is hidden instead.
const ogcService = computed(() => props.resource ? detectOgcService(props.resource) : null)

const errorInfo = computed(() => {
  return props.errorType
    ? getPreviewErrorInfoByType(props.errorType, props.resource, props.fileType)
    : props.resource
      ? getPreviewErrorInfo(props.resource)
      : getPreviewErrorInfoByType('none')
})

const isTooLarge = computed(() => errorInfo.value.type === 'too_large' || errorInfo.value.type === 'too_large_unsized')

const detailText = computed(() => {
  if (props.detail) return props.detail
  if (props.errorType) return null
  return errorInfo.value.type === 'malformed' && props.resource
    ? `${t('Erreur :')} ${getParsingErrorMessage(props.resource)}`
    : null
})

const handleUserCta = () => {
  if (!props.resource) return
  trackEvent('Aperçu', `Demande de prévisualisation (${errorInfo.value.type})`, props.resource.id)
}

const handleProducerCta = () => {
  if (!props.resource) return
  trackEvent('Aperçu', `Demande de prévisualisation producteur (${errorInfo.value.type})`, props.resource.id)
}
</script>

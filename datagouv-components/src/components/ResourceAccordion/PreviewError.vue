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
      {{ message ?? errorInfo.message }}
    </p>
    <p
      v-if="rawParsingError"
      class="text-xs text-gray-medium mb-4 text-center max-w-lg"
    >
      {{ t('Erreur :') }} {{ rawParsingError }}
    </p>

    <!-- User CTA -->
    <div
      v-if="errorInfo.userCta"
      class="mb-4"
    >
      <BrandedButton
        color="secondary"
        @click="handleUserCta"
      >
        {{ errorInfo.userCta }}
      </BrandedButton>
    </div>

    <!-- Override action for too_large, visible to everyone (e.g. force preview) -->
    <div
      v-if="errorInfo.type === 'too_large' && $slots['too-large-action']"
      class="mb-4"
    >
      <slot name="too-large-action" />
    </div>
    <div
      v-else-if="errorInfo.producerCta && showProducerCta"
      class="mb-4"
    >
      <BrandedButton
        color="secondary"
        @click="handleProducerCta"
      >
        {{ errorInfo.producerCta }}
      </BrandedButton>
    </div>

    <BrandedButton
      v-if="resource"
      :href="resource.latest"
      :icon="RiDownloadLine"
      rel="ugc nofollow noopener"
      download
      external
      class="shrink-0"
    >
      {{ t('Télécharger') }}
    </BrandedButton>

    <!-- Original slot for backwards compatibility -->
    <div v-if="$slots.default">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../composables/useTranslation'
import microscopeSrc from '../../../assets/illustrations/microscope.svg?url'
import BrandedButton from '../BrandedButton.vue'
import type { Resource } from '../../types/resources'
import { getPreviewErrorInfo, getPreviewErrorInfoByType, type PreviewErrorType } from '../../functions/previewErrors'
import { trackEvent } from '../../functions/matomo'
import { RiDownloadLine } from '@remixicon/vue'

const props = defineProps<{
  // Optional: some callers (e.g. the tabular explorer) only know the resource id,
  // so they pass a message instead and get no diagnostics or download button.
  resource?: Resource
  showProducerCta?: boolean
  message?: string
  // When an inline message (from the wrapper, e.g. size or CORS) is displayed, the
  // error family that matches this cause drives the CTAs, even if the resource
  // metadata alone would not trigger any.
  fallbackErrorType?: PreviewErrorType
}>()

const { t } = useTranslation()

const errorInfo = computed(() => {
  if (!props.resource) {
    return {
      type: 'none' as const,
      message: '',
      isProducerFault: false,
    }
  }
  return props.fallbackErrorType
    ? getPreviewErrorInfoByType(props.fallbackErrorType, props.resource)
    : getPreviewErrorInfo(props.resource)
})

const rawParsingError = computed(() => {
  if (props.fallbackErrorType || props.message) return null
  return errorInfo.value.type === 'malformed'
    ? props.resource?.extras['analysis:parsing:error'] ?? null
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

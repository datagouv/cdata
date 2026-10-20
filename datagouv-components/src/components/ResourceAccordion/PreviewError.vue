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

    <!-- User CTA -->
    <div
      v-if="errorInfo.userCta"
      class="mb-4"
    >
      <a
        role="button"
        tabindex="0"
        @click="handleUserCta"
        @keydown.enter.prevent="handleUserCta"
        @keydown.space.prevent="handleUserCta"
      >
        {{ errorInfo.userCta }}
      </a>
    </div>

    <!-- Producer CTA -->
    <div v-if="errorInfo.producerCta && showProducerCta">
      <a
        role="button"
        tabindex="0"
        @click="handleProducerCta"
        @keydown.enter.prevent="handleProducerCta"
        @keydown.space.prevent="handleProducerCta"
      >
        {{ errorInfo.producerCta }}
      </a>
    </div>

    <BrandedButton
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
import { toast } from 'vue-sonner'
import { useTranslation } from '../../composables/useTranslation'
import microscopeSrc from '../../../assets/illustrations/microscope.svg?url'
import BrandedButton from '../BrandedButton.vue'
import type { Resource } from '../../types/resources'
import { getPreviewErrorInfo } from '../../functions/previewErrors'
import { trackEvent } from '../../functions/matomo'
import { RiDownloadLine } from '@remixicon/vue'

const props = defineProps<{
  resource: Resource
  showProducerCta?: boolean
  message?: string
}>()

const emit = defineEmits<{
  userCta: []
  producerCta: []
}>()

const { t } = useTranslation()

const errorInfo = computed(() => getPreviewErrorInfo(props.resource))

const handleUserCta = () => {
  trackEvent('Aperçu', 'Demande de prévisualisation', props.resource.title || props.resource.id)
  toast.info(t('Votre demande a bien été enregistrée.'))
  emit('userCta')
}

const handleProducerCta = () => {
  trackEvent('Aperçu', 'Demande de prévisualisation producteur', props.resource.title || props.resource.id)
  toast.info(t('Votre demande a bien été enregistrée.'))
  emit('producerCta')
}
</script>

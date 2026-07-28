<template>
  <div class="text-xs">
    <PreviewUnavailable v-if="!isSizeAllowed">
      {{ fileSizeBytes
        ? t("Le fichier {fileType} est trop volumineux pour être prévisualisé. Téléchargez-le depuis l'onglet Téléchargements.", { fileType })
        : t("La taille du fichier est inconnue, l'aperçu n'est pas disponible. Téléchargez-le depuis l'onglet Téléchargements.")
      }}
    </PreviewUnavailable>
    <PreviewUnavailable v-else-if="hasError">
      {{ t("L'aperçu de ce fichier n'a pas pu être chargé. Téléchargez-le depuis l'onglet Téléchargements.") }}
    </PreviewUnavailable>
    <img
      v-else
      :src="resource.url"
      alt=""
      class="block w-full h-auto max-w-[800px]"
      @error="hasError = true"
    >
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import PreviewUnavailable from './PreviewUnavailable.vue'
import type { Resource } from '../../types/resources'
import { getResourceFilesize } from '../../functions/resources'
import { useTranslation } from '../../composables/useTranslation'
import { useComponentsConfig } from '../../config'

const props = defineProps<{
  resource: Resource
}>()

const { t } = useTranslation()
const config = useComponentsConfig()

const hasError = ref(false)

const fileType = computed(() => props.resource.format?.toUpperCase() ?? t('Fichier'))
const fileSizeBytes = computed(() => getResourceFilesize(props.resource))

const isSizeAllowed = computed(() => {
  const size = fileSizeBytes.value
  const max = config.maxImagePreviewByteSize
  if (!size || !max) return false
  return size <= max
})
</script>

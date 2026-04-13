<template>
  <div class="text-xs">
    <slot
      v-if="data !== null"
      :data="data"
    />
    <div
      v-else-if="loading"
      class="text-gray-medium"
    >
      {{ t("Chargement de l'aperçu {fileType}...", { fileType }) }}
    </div>
    <PreviewUnavailable v-else-if="!isSizeAllowed">
      {{ fileSizeBytes
        ? t("Le fichier {fileType} est trop volumineux pour être prévisualisé. Téléchargez-le depuis l'onglet Téléchargements.", { fileType })
        : t("La taille du fichier est inconnue, l'aperçu n'est pas disponible. Téléchargez-le depuis l'onglet Téléchargements.")
      }}
    </PreviewUnavailable>
    <PreviewUnavailable v-else-if="corsStatus === 'blocked'">
      {{ t("Ce fichier {fileType} ne peut pas être prévisualisé car il est hébergé sur un site distant qui restreint l'accès (CORS). Téléchargez-le depuis l'onglet Téléchargements.", { fileType }) }}
    </PreviewUnavailable>
    <PreviewUnavailable v-else-if="error === 'network'">
      {{ t("Ce fichier est hébergé sur un site externe qui ne permet pas la prévisualisation. Téléchargez-le depuis l'onglet Téléchargements.") }}
    </PreviewUnavailable>
    <PreviewUnavailable v-else-if="error">
      {{ t("L'aperçu de ce fichier n'a pas pu être chargé. Téléchargez-le depuis l'onglet Téléchargements.") }}
    </PreviewUnavailable>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import PreviewUnavailable from './PreviewUnavailable.vue'
import type { Resource } from '../../types/resources'
import { getResourceFilesize, getResourceCorsStatus } from '../../functions/resources'
import { useTranslation } from '../../composables/useTranslation'

const props = defineProps<{
  fileType: string
  resource: Resource
  maxSize: number | undefined
  load: () => Promise<unknown>
}>()

const emit = defineEmits<{
  loaded: []
}>()

const { t } = useTranslation()

const data = ref<unknown>(null)
const loading = ref(false)
const error = ref<'network' | 'generic' | null>(null)

const fileSizeBytes = computed(() => getResourceFilesize(props.resource))
const corsStatus = computed(() => getResourceCorsStatus(props.resource))

const isSizeAllowed = computed(() => {
  const size = fileSizeBytes.value
  const max = props.maxSize
  if (!size || !max) return false
  return size <= max
})

onMounted(async () => {
  if (!isSizeAllowed.value || corsStatus.value === 'blocked') return

  loading.value = true
  try {
    data.value = await props.load()
    await nextTick()
    emit('loaded')
  }
  catch (err) {
    console.error('Error loading preview:', err)
    error.value = err instanceof TypeError ? 'network' : 'generic'
  }
  finally {
    loading.value = false
  }
})
</script>

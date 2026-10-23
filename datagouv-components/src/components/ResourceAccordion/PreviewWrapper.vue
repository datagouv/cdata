<template>
  <div
    class="text-xs"
    :class="fill ? 'flex min-h-0 flex-1 flex-col' : ''"
  >
    <slot
      v-if="data !== null"
      :data="data"
    />
    <slot
      v-else-if="loading"
      name="loading"
    >
      <div class="text-gray-medium">
        {{ t("Chargement de l'aperçu {fileType}...", { fileType }) }}
      </div>
    </slot>
    <PreviewError
      v-else
      :resource="resource"
      :message="errorMessage"
      :fallback-error-type="fallbackErrorType"
      :show-producer-cta="canEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import PreviewError from './PreviewError.vue'
import type { Resource } from '../../types/resources'
import { getResourceFilesize, getResourceCorsStatus } from '../../functions/resources'
import type { PreviewErrorType } from '../../functions/previewErrors'
import { useTranslation } from '../../composables/useTranslation'

const props = defineProps<{
  fileType: string
  resource: Resource
  maxSize: number | undefined
  load: () => Promise<unknown>
  // Fill the available height (fullscreen) instead of sizing to content.
  fill?: boolean
  canEdit?: boolean
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

// A diagnosed availability failure (the robot's check could not reach the
// file) is the actual cause: it wins over the size/CORS heuristics, which
// would blame the file for not loading.
const unavailable = computed(() => props.resource.extras['check:available'] === false)

const isSizeAllowed = computed(() => {
  const size = fileSizeBytes.value
  const max = props.maxSize
  if (!size) return false
  if (!max) return true
  return size <= max
})

const fallbackErrorType = computed<PreviewErrorType | undefined>(() => {
  if (unavailable.value) return 'unavailable'
  if (error.value === 'network') return 'network'
  if (error.value) return 'unknown'
  if (corsStatus.value === 'blocked') return 'cors'
  if (!isSizeAllowed.value) return 'too_large'
  return undefined
})

const errorMessage = computed<string | undefined>(() => {
  // No inline message when a family diagnosis exists: PreviewError then
  // displays the family message and its matching CTAs.
  if (unavailable.value) return undefined
  if (error.value === 'network') {
    return t('Ce fichier est hébergé sur un site externe qui ne permet pas la prévisualisation.')
  }
  if (error.value) {
    return t('L\'aperçu de ce fichier n\'a pas pu être chargé.')
  }
  if (corsStatus.value === 'blocked') {
    return t('Ce fichier est hébergé sur un site externe qui n\'autorise pas son affichage dans data.gouv.fr.')
  }
  if (!isSizeAllowed.value) {
    if (!fileSizeBytes.value) {
      return t('La taille du fichier est inconnue. Il est possible que le fichier soit trop volumineux pour être prévisualisé.')
    }
    return t('Ce fichier {fileType} est trop volumineux pour être prévisualisé.', { fileType: props.fileType })
  }
  return undefined
})

onMounted(async () => {
  if (unavailable.value || !isSizeAllowed.value || corsStatus.value === 'blocked') return

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

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
      :show-producer-cta="canEdit"
      @user-cta="$emit('userCta')"
      @producer-cta="$emit('producerCta')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import PreviewError from './PreviewError.vue'
import type { Resource } from '../../types/resources'
import { getResourceFilesize, getResourceCorsStatus } from '../../functions/resources'
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
  userCta: []
  producerCta: []
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

const errorMessage = computed<string | undefined>(() => {
  if (error.value === 'network') {
    return t('Ce fichier est hébergé sur un site externe qui ne permet pas la prévisualisation. Téléchargez-le depuis l\'onglet Téléchargements.')
  }
  if (error.value) {
    return t('L\'aperçu de ce fichier n\'a pas pu être chargé. Téléchargez-le depuis l\'onglet Téléchargements.')
  }
  if (corsStatus.value === 'blocked') {
    return t('Ce fichier est hébergé sur un site externe qui n\'autorise pas son affichage dans data.gouv.fr. Téléchargez-le depuis l\'onglet Téléchargements.')
  }
  if (!isSizeAllowed.value) {
    if (fileSizeBytes.value === -1) {
      return t('La taille du fichier est inconnue. Il est possible que le fichier soit trop volumineux pour être prévisualisé. Téléchargez-le depuis l\'onglet Téléchargements.')
    }
    return t('Ce fichier {fileType} est trop volumineux pour être prévisualisé. Téléchargez-le depuis l\'onglet Téléchargements.', { fileType: props.fileType })
  }
  return undefined
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

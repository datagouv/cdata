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
      :error-type="diagnosis"
      :file-type="fileType"
      :show-producer-cta="canEdit"
    >
      <!-- Forward the slot only when the parent actually filled it: otherwise
        (Json/Xml previews) `$slots['too-large-action']` in PreviewError would
         always be truthy and shadow the producer CTA with an empty div. -->
      <template
        v-if="$slots['too-large-action']"
        #too-large-action
      >
        <slot
          name="too-large-action"
          :force="force"
        />
      </template>
    </PreviewError>
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
// Set by the too-large slot's `force()` (below).
const forced = ref(false)

const fileSizeBytes = computed(() => getResourceFilesize(props.resource))
const corsStatus = computed(() => getResourceCorsStatus(props.resource))

// A diagnosed availability failure (the robot's check could not reach the
// file) is the actual cause: it wins over the size/CORS heuristics, which
// would blame the file for not loading.
const unavailable = computed(() => props.resource.extras['check:available'] === false)

const isSizeAllowed = computed(() => {
  if (forced.value) return true
  const size = fileSizeBytes.value
  const max = props.maxSize
  if (!size) return false
  if (!max) return true
  return size <= max
})

// The runtime diagnosis, passed as the explicit error type to PreviewError: the
// metadata cannot know about this wrapper's runtime failures (load, CORS,
// size), so the texts and CTAs come from these error types instead.
const diagnosis = computed<PreviewErrorType | undefined>(() => {
  if (unavailable.value) return 'unavailable'
  if (error.value === 'network') return 'network'
  if (error.value) return 'unknown'
  if (corsStatus.value === 'blocked') return 'cors'
  if (!isSizeAllowed.value) {
    // `fileSizeBytes` is falsy when the size is unknown, in which case the
    // diagnosis cannot even assert the file is too large.
    return fileSizeBytes.value ? 'too_large' : 'too_large_unsized'
  }
  return undefined
})

async function attemptLoad() {
  if (unavailable.value || !isSizeAllowed.value || corsStatus.value === 'blocked') return
  if (data.value !== null || loading.value) return

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
}

onMounted(attemptLoad)

// Exposed to the too-large slot: re-attempt the load and bypass ONLY the size
// gate (the browser can still read a large PDF) while the unavailable and CORS
// gates stay intact.
function force() {
  forced.value = true
  attemptLoad()
}
</script>

<template>
  <div class="text-xs">
    <PreviewError
      v-if="!isSizeAllowed || hasError"
      :resource="resource"
      :error-type="errorType"
      :file-type="fileType"
      :show-producer-cta="canEdit"
    />
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
import PreviewError from './PreviewError.vue'
import type { Resource } from '../../types/resources'
import { getResourceFilesize } from '../../functions/resources'
import type { PreviewErrorType } from '../../functions/previewErrors'
import { useTranslation } from '../../composables/useTranslation'
import { useComponentsConfig } from '../../config'

const props = defineProps<{
  resource: Resource
  canEdit?: boolean
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

// The metadata cannot know about a runtime failure, so an explicit error type is
// always passed: `network` for a failed load, otherwise the right too_large
// variant (the size is unknown when `fileSizeBytes` is falsy).
const errorType = computed<PreviewErrorType>(() => {
  if (hasError.value) return 'network'
  return fileSizeBytes.value ? 'too_large' : 'too_large_unsized'
})
</script>

<template>
  <PreviewWrapper
    v-slot="{ data }"
    file-type="JSON"
    :resource="resource"
    :max-size="config.maxJsonPreviewCharSize"
    :load="load"
  >
    <JsonViewer
      :value="data"
      boxed
      sort
      theme="light"
      :max-depth="3"
      :expand-depth="2"
      :indent-width="2"
    />
  </PreviewWrapper>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useComponentsConfig } from '../../config'
import PreviewWrapper from './PreviewWrapper.vue'
import type { Resource } from '../../types/resources'

const JsonViewer = defineAsyncComponent(() =>
  import('vue3-json-viewer').then((module) => {
    import('vue3-json-viewer/dist/vue3-json-viewer.css')
    return module.JsonViewer
  }),
)

const props = defineProps<{
  resource: Resource
}>()

const config = useComponentsConfig()

const load = async () => {
  const response = await fetch(props.resource.url)
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return response.json()
}
</script>

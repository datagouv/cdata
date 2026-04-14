<template>
  <PreviewWrapper
    v-slot="{ data }"
    file-type="XML"
    :resource="resource"
    :max-size="config.maxXmlPreviewCharSize"
    :load="load"
  >
    <XmlViewer :xml="(data as string)" />
  </PreviewWrapper>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useComponentsConfig } from '../../config'
import PreviewWrapper from './PreviewWrapper.vue'
import type { Resource } from '../../types/resources'
import '../../types/vue3-xml-viewer.d'

const XmlViewer = defineAsyncComponent(() =>
  import('vue3-xml-viewer').then(module => module.default || module.XmlViewer),
)

const props = defineProps<{
  resource: Resource
}>()

const config = useComponentsConfig()

const load = async () => {
  const response = await fetch(props.resource.url)
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  return response.text()
}
</script>

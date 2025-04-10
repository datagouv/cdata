<template>
  <FileEditModal
    v-if="resource"
    :resource
    open-on-mounted
  />
</template>

<script setup lang="ts">
import type { Dataset, DatasetV2, Resource, SchemaResponseData } from '@datagouv/components-next'
import FileEditModal from './FileEditModal.vue'
import type { CommunityResourceForm, ResourceForm } from '~/types/types'

const props = defineProps<{
  dataset: Dataset | DatasetV2
  schemas: SchemaResponseData
}>()

const { $api } = useNuxtApp()

const resource = ref<ResourceForm | CommunityResourceForm | null>(null)

onMounted(async () => {
  const hash = window.location.hash
  if (!hash) return

  const resourceId = hash.substring(1)
  resource.value = resourceToForm(await $api<Resource>(`/api/1/datasets/${props.dataset.id}/resources/${resourceId}`), props.schemas)
})
</script>

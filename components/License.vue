<template>
  <NuxtLink
    v-if="license"
    :to="license.url"
    class="px-1 py-[2px] font-mono bg-gray-lower text-gray-medium rounded"
    external
  >
    {{ license.title }}
  </NuxtLink>
</template>

<script setup lang="ts">
import type { License } from '@datagouv/components-next'

const props = defineProps<{
  licenseId: string
}>()

const { data: licenses } = await useAPI<Array<License>>('/api/1/datasets/licenses/')
const license = computed(() => {
  return licenses.value.find(l => l.id === props.licenseId)
})
</script>

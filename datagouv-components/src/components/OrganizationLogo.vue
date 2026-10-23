<template>
  <div :class="sizeClass">
    <img
      v-if="thumbnail"
      :src="thumbnail"
      class="size-full object-contain"
    >
    <Placeholder
      v-else
      type="Organization"
      class="size-full"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OrganizationOrSuggest } from '../types/organizations'
import type { OrganizationOption } from '../functions/organization-options'
import Placeholder from './Placeholder.vue'

const props = defineProps<{
  // OrganizationOption covers the lightweight entries built from search facets,
  // which carry neither a logo nor a thumbnail.
  organization: OrganizationOrSuggest | OrganizationOption
  sizeClass: string
}>()

const thumbnail = computed(() => {
  if ('logo_thumbnail' in props.organization) return props.organization.logo_thumbnail
  if ('image_url' in props.organization) return props.organization.image_url

  return null
})
</script>

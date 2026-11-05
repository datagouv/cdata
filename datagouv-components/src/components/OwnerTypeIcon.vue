<template>
  <component
    :is="icon"
    v-if="icon"
    class="flex-none"
    :class="sizeClass"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { findOrganizationType, type OrganizationTypes, type UserType } from '../functions/organizations'

const props = withDefaults(defineProps<{
  type: OrganizationTypes | UserType
  sizeClass?: string
}>(), {
  sizeClass: 'size-3.5',
})

const icon = computed(() => findOrganizationType(props.type).icon)
</script>

<template>
  <component
    :is="icon"
    v-if="icon"
    class="size-3.5 flex-none"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { findOrganizationType, type OrganizationTypes, type UserType } from '../functions/organizations'

const props = defineProps<{
  type: OrganizationTypes | UserType
}>()

const icon = computed(() => findOrganizationType(props.type).icon)
</script>

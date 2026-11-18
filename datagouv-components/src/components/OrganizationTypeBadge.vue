<template>
  <ObjectCardBadge
    v-if="organizationType.type !== OTHER"
    :icon="organizationType.icon"
    :tone="type === PUBLIC_SERVICE || type === LOCAL_AUTHORITY ? 'info' : 'neutral'"
  >
    {{ organizationType.label }}
  </ObjectCardBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { findOrganizationType, LOCAL_AUTHORITY, OTHER, PUBLIC_SERVICE, type OrganizationTypes } from '../functions/organizations'
import ObjectCardBadge from './ObjectCardBadge.vue'

const props = defineProps<{
  type: OrganizationTypes
}>()

const organizationType = computed(() => findOrganizationType(props.type))
</script>

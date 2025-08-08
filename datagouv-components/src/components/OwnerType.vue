<template>
  <div :class="`${colorClass} flex items-center gap-1`">
    <OwnerTypeIcon
      :type="type"
      class="size-4"
    />
    <div :class="sizeClass">
      {{ name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { findOrganizationType, type OrganizationTypes, type UserType } from '../functions/organizations'
import OwnerTypeIcon from './OwnerTypeIcon.vue'

const props = withDefaults(defineProps<{
  type: OrganizationTypes | UserType
  size?: 'base' | 'sm' | 'xs'
  color?: 'black' | 'gray'
}>(), {
  size: 'sm',
  color: 'gray',
})

const colorClass = computed(() => {
  return {
    black: 'text-gray-title',
    gray: 'text-gray-medium',
  }[props.color]
})

const sizeClass = computed(() => {
  return {
    base: 'text-base',
    sm: 'text-sm',
    xs: 'text-xs',
  }[props.size]
})

const name = computed(() => findOrganizationType(props.type).label)
</script>

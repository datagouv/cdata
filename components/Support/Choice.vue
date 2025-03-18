<template>
  <button
    type="button"
    class="px-4 py-2 rounded-md bg-blue-action-low hover:bg-blue-action-low-hover active:bg-blue-action-low-active border-2 aria-selected:bg-datagouv aria-selected:text-white"
    :class="{ 'border-blue-outline': active, 'border-transparent': !active }"
    :aria-selected="selected"
    role="option"
    tabindex="-1"
    @click="$emit('select')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  select: []
}>()
defineProps<{
  active: boolean
  selected: boolean
}>()
</script>

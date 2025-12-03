<template>
  <span
    v-if="props.required"
    class="text-new-primary"
  >*</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  required: boolean
}>()
</script>

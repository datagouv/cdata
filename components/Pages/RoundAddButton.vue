<template>
  <!-- Shown while its `group/add` ancestor (the area where it inserts) is hovered. Wider
       than the gap between two blocs: above the bloc that comes after it in the page. The
       z-index is on the button alone: on an ancestor, it would trap its menu with it.
       Important, as the DSFR turns the background of a hovered button to its grey. -->
  <button
    type="button"
    class="relative z-20 inline-flex items-center justify-center size-6 rounded-full !bg-(--edit-accent) text-(--edit-accent-text) shadow-sm opacity-0 group-hover/add:opacity-100 focus-visible:opacity-100 transition-opacity"
    :title="label"
    :aria-label="label"
  >
    <RiAddLine class="size-4" />
  </button>
</template>

<script setup lang="ts">
import { RiAddLine } from '@remixicon/vue'

defineProps<{
  label: string
}>()
</script>

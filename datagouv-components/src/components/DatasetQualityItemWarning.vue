<template>
  <li
    v-if="!qualityItem"
    class="text-warning-dark flex flex-wrap items-center"
  >
    <p class="!m-0 text-sm">
      <span
        class="fr-icon-warning-line fr-icon--sm"
        aria-hidden="true"
      />
      {{ message }}
    </p>
  </li>
</template>

<script setup lang="ts">
defineProps<{
  qualityItem: boolean | null
  message: string
}>()
</script>

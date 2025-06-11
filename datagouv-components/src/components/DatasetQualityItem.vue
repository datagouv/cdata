<template>
  <li>
    <p
      v-if="passed"
      class="fr-my-0 text-sm"
    >
      <span
        class="fr-icon-check-line"
        aria-hidden="true"
      />
      {{ messagePassed }}
    </p>
    <p
      v-else
      class="my-0 text-gray-medium"
    >
      <span
        class="fr-icon-warning-line"
        aria-hidden="true"
      />
      {{ messageFailed }}
    </p>
  </li>
</template>

<script setup lang="ts">
defineProps<{
  passed?: boolean | null
  messagePassed: string
  messageFailed: string
}>()
</script>

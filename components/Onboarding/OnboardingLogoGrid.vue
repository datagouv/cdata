<template>
  <section class="py-8">
    <SmallCapsLabel
      v-if="label"
      class="mb-4"
    >
      {{ label }}
    </SmallCapsLabel>
    <div class="flex flex-wrap items-center justify-between">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import SmallCapsLabel from '~/components/Onboarding/SmallCapsLabel.vue'

defineProps<{
  label?: string
}>()
</script>

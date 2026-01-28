<template>
  <article
    class="p-4 border bg-white border-gray-default relative hover:bg-gray-some fr-enlarge-link"
    :class="articleClass"
  >
    <div class="flex flex-wrap md:flex-nowrap gap-4 items-start">
      <div
        v-if="$slots.media"
        class="flex-none"
      >
        <slot name="media" />
      </div>
      <div class="flex-1 overflow-hidden">
        <slot />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  articleClass?: string | string[] | Record<string, boolean>
}>()
</script>

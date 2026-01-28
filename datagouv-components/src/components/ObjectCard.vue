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
        <div
          class="flex justify-center items-center border border-gray-lower bg-[#fff] rounded-md overflow-hidden"
          :class="mediaContainerClass"
        >
          <slot name="media" />
        </div>
      </div>
      <div class="flex-1 overflow-hidden">
        <slot />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  articleClass?: string | string[] | Record<string, boolean>
  mediaSize?: 'sm' | 'lg'
}>(), {
  mediaSize: 'sm',
})

const mediaContainerClass = computed(() => {
  if (props.mediaSize === 'lg') {
    return 'w-[240px] h-[160px]'
  }
  return 'p-2'
})
</script>

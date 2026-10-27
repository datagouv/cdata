<template>
  <article
    class="dg-object-card fr-enlarge-link"
    :class="articleClass"
  >
    <slot name="cover" />
    <div
      v-if="$slots.badge"
      class="dg-object-card-badges"
    >
      <slot name="badge" />
    </div>
    <div class="dg-object-card-layout">
      <div
        v-if="$slots.media"
        class="dg-object-card-media"
      >
        <div
          class="dg-object-card-media-frame"
          :class="mediaContainerClass"
        >
          <slot name="media" />
        </div>
      </div>
      <div class="dg-object-card-body">
        <slot />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import '../../assets/cards.css'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    articleClass?: string | string[] | Record<string, boolean>
    mediaSize?: 'sm' | 'lg' | 'xl'
  }>(),
  {
    mediaSize: 'sm',
  },
)

const mediaContainerClass = computed(() => {
  if (props.mediaSize === 'xl') {
    return 'dg-object-card-media-xl'
  }
  if (props.mediaSize === 'lg') {
    return 'dg-object-card-media-lg'
  }
  return 'dg-object-card-media-sm'
})
</script>

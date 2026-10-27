<template>
  <article class="object-card fr-enlarge-link" :class="articleClass">
    <div v-if="$slots.cover" class="object-card__cover">
      <slot name="cover" />
    </div>
    <div v-if="$slots.badge" class="object-card__badges">
      <slot name="badge" />
    </div>
    <div class="object-card__layout">
      <div v-if="$slots.media" class="object-card__media">
        <div class="object-card__media-frame" :class="mediaContainerClass">
          <slot name="media" />
        </div>
      </div>
      <div class="object-card__body">
        <slot />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
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
    return 'object-card__media--xl'
  }
  if (props.mediaSize === 'lg') {
    return 'object-card__media--lg'
  }
  return 'object-card__media--sm'
})
</script>

<style scoped>
.object-card {
  container-type: inline-size;
  position: relative;
  min-width: 0;
  padding: 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 0.25rem;
  background: #fff;
  color: #161616;
}
.object-card__layout {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  min-width: 0;
}
.object-card__body {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
}
.object-card__body > :deep(*) {
  min-width: 0;
  margin-top: 0;
  margin-bottom: 0;
}
.object-card__media {
  flex: none;
  max-width: 100%;
}
.object-card__media-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid #e5e5e5;
  border-radius: 0.25rem;
  background: #fff;
}
.object-card__media--sm {
  padding: 0;
}
.object-card__media--lg {
  width: 12rem;
  height: 7.5rem;
}
.object-card__media--xl {
  width: 14rem;
  height: 10rem;
}
.object-card__badges:empty {
  display: none;
}
.object-card__badges:has(> *) {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}
.object-card:has(:deep(.object-card-title__link:focus-visible)) {
  outline: 2px solid #0a76f6;
  outline-offset: 3px;
}
@media (hover: hover) {
  .object-card:has(:deep(.object-card-title__link:hover)) {
    background: #f6f6f6;
  }
}
@container (max-width: 480px) {
  .object-card__layout:has(.object-card__media--lg, .object-card__media--xl) {
    flex-direction: column;
  }
  .object-card__media:has(.object-card__media--lg, .object-card__media--xl),
  .object-card__media--lg,
  .object-card__media--xl {
    width: 100%;
  }
  .object-card__media--lg,
  .object-card__media--xl {
    height: auto;
    aspect-ratio: 16 / 9;
  }
}
@container (max-width: 280px) {
  .object-card__layout {
    flex-direction: column;
    gap: 0.75rem;
  }
  .object-card__body {
    width: 100%;
  }
}
</style>

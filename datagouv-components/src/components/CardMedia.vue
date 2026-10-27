<script setup lang="ts">
import '../../assets/cards.css'
import { computed, ref, watch } from 'vue'
import { RiArticleLine, RiBarChartBoxLine, RiLineChartLine } from '@remixicon/vue'

const props = defineProps<{
  src?: string | null
  alt?: string
  kind: 'post' | 'reuse' | 'chart'
  fit?: 'cover' | 'contain'
}>()
const failed = ref(false)
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)
const hasImage = computed(() => !!props.src?.trim() && !failed.value)
const icon = computed(
  () => ({ post: RiArticleLine, reuse: RiLineChartLine, chart: RiBarChartBoxLine })[props.kind],
)
</script>

<template>
  <div
    class="dg-card-media"
    :data-empty="!hasImage"
    :data-fit="fit"
  >
    <img
      v-if="hasImage"
      :src="src!"
      :alt="alt || ''"
      loading="lazy"
      @error="failed = true"
    >
    <component
      :is="icon"
      v-else
      class="dg-card-empty-symbol dg-ds-icon"
      data-icon-size="fluid"
      aria-hidden="true"
      focusable="false"
    />
  </div>
</template>

<style scoped>
.dg-card-media {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  background: var(--dg-card-surface-subtle);
  color: var(--dg-card-text-secondary);
}
.dg-card-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dg-card-media[data-fit='contain'] img {
  object-fit: contain;
  padding: var(--dg-card-space-16);
  box-sizing: border-box;
}
/* Media placeholder, not a control icon: deliberately larger than interface icons. */
.dg-card-empty-symbol {
  width: var(--dg-card-space-48);
  height: var(--dg-card-space-48);
  flex: none;
  pointer-events: none;
}
</style>
